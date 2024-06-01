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
  const [chats, setChats] = useState({})
  const [privateChatsMap, setPrivateChatsMap] = useState({})
  const [messageGroups, setMessageGroups] = useState({})
  const [profile, setProfile] = useState({})
  const [blockedList, setBlockedList] = useState([])

  useEffect(() => {
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

    /**
     * 
     * @param {Chat[]} myChats 
     */
    function onChatsReceived(myChats) {
      setChats(prev => {
        let updatedChats = { ...prev }
        myChats.forEach(chat => {
          updatedChats[chat._id] = chat

          //NOTE: It is not guarenteed that the messages map will be updated with the new group by the time the messages will arrive
          // To eliminate race conditions - it will be populated on message received only (if it does not exist).

          socket.emit("messages:get", chat._id) //, groupsMessagesStore[group._id].length)
          // TODO: should blocked chats be displayed?
          if (chat.type === 'private') {
            // NOTE: in a private chat there are only 2 members - this user and another.
            const contact = chat.members.find(member => member._id != sessionStorage['id'])
            if (!contact) {
              console.debug(`private chat ${chat._id} is missing other member`)
            }
            else {
              // NOTE: IMPORTANT! added 'privateChatName' and 'privateChatContactId' in chats property - state!
              updatedChats[chat._id] = { ...chat, privateChatName: contact.username, privateChatContactId: contact._id }
              setPrivateChatsMap(prevMap => ({ ...prevMap, [contact._id]: chat._id }))
            }
          }
        })
        return updatedChats
      })
    }

    /**
     * bulk of messages of 1 chat specified by chatId
     * @param {MessagesBulk} payload - {chatId: string, messages: [{message: {id: int, senderId, content, timestamp}}]}
     */
    function onMessageReceived(payload) {
      setMessageGroups(prev => {
        // //prevent duplicates - when debugging the server
        // let msgExist = prev[payload.groupId].find(msg=>msg.id==payload.id)
        // if(msgExist){
        //   return prev
        // }
        const chatId = payload.chatId
        if (!prev[chatId]) {
          return {
            ...prev,
            [chatId]: payload.messages.map(message => ({
              id: message.id,
              sender: message.senderId, // TODO: replace with username
              message: message.content
            }))
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
            ...messages.map(message => ({
              id: message.id,
              sender: message.senderId, // TODO: replace with username
              message: message.content
            }))
          ]
        }
      })
    }


    /**
     * 
     * @param {Chat} chat 
     */
    function onGroupJoin(chat) {

      //TODO: Check if this function can be replaced by other existing function.

      // Refresh all groups and all messages:
      // socket.emit('groups:getAllUser') // all details with groups
      //OR

      console.log("invited to join group:", groupId)
      if (!chats[chat._id] || !Object.keys(messageGroups).includes(chat._id)) {
        setGroupChats(prev => ({ ...prev, [chat._id]: chat }))
        setMessageGroups(prev => ({ ...prev, [chat._id]: [] }))
        socket.emit('chat:group:join', chat._id)
        console.log("accepted invitation to join chat:", chat._id)
      }
      else {
        console.log('already in chat', chat._id)
      }
    }

    function onChatsLeave(chatsIds = []) {
      console.log("removed from chats:", chatsIds)

      setChats(previousChats => {
        chatsIds.forEach(chatId => {
          // remove keys from privateChatMap
          setPrivateChatsMap(previousPrivates => {
            delete previousPrivates[previousChats[chatId]?.privateChatContactId]
            return previousPrivates
          })
          // remove chat key
          delete previousChats[chatId]
        })
        return previousChats
      })

      // if one of the removed chats is open - navigate away
      const matches = window.location.pathname.match(/chats\/private\/(?<id>[^\/]+)/)
      if (matches) {
        const chatId = matches.groups.id
        if (chatsIds.includes(chatId)) {
          navigate('/chats')
        }
      }
    }

    function onChatRedirection(chatId) {
      if (Object.keys(chats).length) {
        const destination = chats[chatId]
        navigate('/chats/' + destination.type + '/' + destination.id)
      }
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('profile:received', onProfileReceived)
    socket.on('contacts:received', onContactsReceived);
    socket.on('chats:received', onChatsReceived);
    socket.on('message:received', onMessageReceived);

    // socket.on('contact:blocked', onContactBlocked);
    socket.on('group:joined', onGroupJoin);
    socket.on('chats:removed', onChatsLeave);
    socket.on('chat:redirect', onChatRedirection);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('profile:received', onProfileReceived)
      socket.off('contacts:received', onContactsReceived);
      socket.off('chats:received', onChatsReceived);
      socket.off('message:received', onMessageReceived);

      socket.off('group:joined', onGroupJoin);
      socket.off('chats:removed', onChatsLeave);
      socket.off('chat:redirect', onChatRedirection);
      // socket.off('contact:blocked', onContactBlocked);
      socket.disconnect()
    };
  }, [sessionStorage['accessToken']]);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      contacts,
      chats,
      privateChatsMap,
      messageGroups,
      profile,
      blockedList
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };