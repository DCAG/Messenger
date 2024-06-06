// ref: https://dev.to/stephengade/build-custom-middleware-for-a-reactnextjs-app-with-context-api-2ed3
import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from '../utils/socket'
import '../utils/types'

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const navigate = useNavigate()

  const [isConnected, setIsConnected] = useState(socket.connected)
  const [contacts, setContacts] = useState({})
  const [onlineContacts, setOnlineContacts] = useState({})
  const [chats, setChats] = useState({})
  const [privateChatsMap, setPrivateChatsMap] = useState({})
  const [messageGroups, setMessageGroups] = useState({})
  const [profile, setProfile] = useState({})
  const [blockedList, setBlockedList] = useState([])
  const [pendingRedirection, setPendingRedirection] = useState(null)

  // Toast
  const [pendingToast, setPendingToast] = useState({})
  const [toast, setToast] = useState({ show: false, type: 'message', payload: {} });
  const showToast = (type, payload) => {
    setToast({ show: true, type, payload });
    setTimeout(() => {
      setToast({ show: false, type: 'message', payload: {} });
    }, 3000);
  };

  useEffect(() => {
    if (Object.keys(pendingToast).length > 0) {
      if(pendingToast.type === 'message'){
        const { senderId, content } = pendingToast.payload.messages[0]
        if(contacts[senderId]){
          const senderName = contacts[senderId]?.username ?? senderId
          const chat = chats[pendingToast.payload.chatId] ?? pendingToast.payload.chatId
          const where = (chat && chat.type === 'group') ? chat?.name : ''
          showToast('message', { chatName: where, contactName: senderName, message: content })
        }
      }else if(pendingToast.type === 'connection'){
        showToast(pendingToast.type, contacts[pendingToast.contactName]?.username)
      }
      setPendingToast({})
    }
  }, [pendingToast])

  useEffect(() => {
    //NOTE: inside this closure all the states above will remain with initial state (stale data)
    // to interact with them the either set new states and handle them in another useEffect or inside any setState

    const token = sessionStorage['accessToken'];
    if (!isConnected && token) {
      socket.auth = { token }
      socket.connect()
    }

    function onConnect() {
      setIsConnected(true);
      socket.emit('contacts:get') //TODO: replace getAll with get or create seperate call - to update specific user or this user.
      socket.emit('chats:getMy')
      socket.emit('profile:getMy')
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    /**
     * 
     * @param {Contact} myProfile 
     */
    function onProfileReceived(myProfile) {
      setBlockedList(prev => myProfile.blockedList ?? prev)
      setProfile(prev => myProfile ?? prev)
    }

    /**
     * 
     * @param {Contact[]} users
     */
    function onContactsReceived(users) {
      console.log("users.length", users.length)
      setContacts(prev => {
        let myContacts = { ...prev }
        for (let user of users) {
          myContacts[user._id] = user
        }
        return myContacts
      })
    }

    function onContactsOnline(onlineContactsMap) {
      if (Object.keys(onlineContactsMap).length === 1) {
        setPendingToast({type: 'connection', contactName: Object.keys(onlineContactsMap)[0]})
      }

      setOnlineContacts(prev => ({ ...prev, ...onlineContactsMap }))
    }

    function onContactsOffline(contactId) {
      setOnlineContacts(prev => {
        delete prev[contactId]
        return {...prev}
      })
    }

    /**
     * 
     * @param {Chat[]} myChats 
     */
    function onChatsReceived(myChats) {
      console.log("myChats.length", myChats.length)
      setChats(prev => {
        let updatedChats = { ...prev }
        myChats.forEach(chat => {
          // TODO: should blocked chats be displayed?
          if (chat.type === 'private') {
            // NOTE: in a private chat there are only 2 members - this user and another.
            const contact = chat.members.find(member => member._id != sessionStorage['id'])
            if (!contact) {
              console.debug(`private chat ${chat._id} is missing other member`)
            }
            else {
              // NOTE: IMPORTANT! added properties 'privateChatName' and 'privateChatContactId' to chat object
              updatedChats[chat._id] = {
                ...chat,
                privateChatName: contact.username,
                privateChatContactId: contact._id
              }
              setPrivateChatsMap(prevMap => ({ ...prevMap, [contact._id]: chat._id }))
            }
          }
          else{
            // chat.type === 'group'
            // FUTURE: chat.type === 'self' ?
            updatedChats[chat._id] = chat
          }
          
          //NOTE: It is not guarenteed that the messages map will be updated with the new group by the time the messages will arrive
          // To eliminate race conditions - it will be updated (and created) on message received only (if it does not exist).
          socket.emit("messages:get", chat._id)
        })
        return updatedChats
      })
    }

    /**
     * bulk of messages of 1 chat specified by chatId
     * @param {{chatId: String, messages:Array<Message>}} payload
     */
    function onMessageReceived(payload) {
      if (payload?.messages.length === 1) {
        setPendingToast({type: 'message', payload})
      }

      setMessageGroups(prev => {
        const chatId = payload.chatId
        if (!prev[chatId]) {
          return {
            ...prev,
            [chatId]: payload.messages
          }
        }

        const serverOffset = payload.messages[payload.messages.length - 1]?.id ?? 0
        const clientOffset = prev[chatId][prev[chatId].length - 1]?.id ?? 0

        if (clientOffset >= serverOffset) {
          return prev
        }

        const numOfNewMessages = payload.messages.length
        const numOfMessagesMissing = serverOffset - clientOffset
        const duplicatesExist = numOfNewMessages > numOfMessagesMissing
        const noDuplicates = numOfNewMessages <= numOfMessagesMissing // how did this happen? volatile messages?
        const exactMissingMessages = numOfNewMessages === numOfMessagesMissing

        let messages = payload.messages
        if (duplicatesExist) {
          const start = numOfNewMessages - numOfMessagesMissing - 1
          messages = messages.slice(start)
        }

        return {
          ...prev,
          [chatId]: [
            ...prev[chatId],
            ...messages
          ]
        }
      })
    }

    function onChatsLeave(chatsIds = []) {
      console.log("removed from chats:", chatsIds)

      setChats(previousChats => {
        chatsIds.forEach(chatId => {
          // remove keys from privateChatMap
          setPrivateChatsMap(previousPrivates => {
            delete previousPrivates[previousChats[chatId]?.privateChatContactId]
            return {...previousPrivates}
          })
          // remove chat key
          delete previousChats[chatId]
        })
        return {...previousChats}
      })

      // if one of the removed chats is open - navigate away
      // NOTE: useParams() from react-router-dom did not work here - probably because this is inside useEffect closure (read NOTE at the top)
      const matches = window.location.pathname.match(/chats\/(private|group)\/(?<id>[^\/]+)/)
      if (matches) {
        const chatId = matches.groups.id
        if (chatsIds.includes(chatId)) {
          navigate('/chats')
        }
      }
    }

    function onChatRedirection(chatId) {
      setPendingRedirection(chatId)
      // NOTE: see separate useEffect that handles redirection
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('profile:received', onProfileReceived)
    socket.on('contacts:received', onContactsReceived);
    socket.on('contacts:online', onContactsOnline);
    socket.on('contacts:offline', onContactsOffline);
    socket.on('chats:received', onChatsReceived);
    socket.on('message:received', onMessageReceived);
    socket.on('chats:removed', onChatsLeave);
    socket.on('chat:redirect', onChatRedirection);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('profile:received', onProfileReceived)
      socket.off('contacts:received', onContactsReceived);
      socket.off('contacts:online', onContactsOnline);
      socket.off('contacts:offline', onContactsOffline);
      socket.off('chats:received', onChatsReceived);
      socket.off('message:received', onMessageReceived);
      socket.off('chats:removed', onChatsLeave);
      socket.off('chat:redirect', onChatRedirection);
      socket.disconnect()
    };
  }, [sessionStorage['accessToken']]);

  useEffect(() => {
    if (pendingRedirection) {
      const destination = chats[pendingRedirection]
      if (destination) {
        setPendingRedirection(null)
        navigate('/chats/' + destination.type + '/' + destination.id);
      } else {
        console.warn('No chats available for redirection');
      }
    }
  }, [pendingRedirection, chats])

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      contacts,
      onlineContacts,
      chats,
      privateChatsMap,
      messageGroups,
      profile,
      blockedList,
      toast
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };