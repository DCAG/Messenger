// ref: https://dev.to/stephengade/build-custom-middleware-for-a-reactnextjs-app-with-context-api-2ed3
import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from '../utils/socket'
import useAuth from "../utils/useAuth";
import '../utils/types'

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const navigate = useNavigate()

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [contacts, setContacts] = useState({})
  const [chats, setChats] = useState({})
  const [privateChatsMap, setPrivateChatsMap] = useState({})
  const [messageGroups, setMessageGroups] = useState({})
  const [blockedList, setBlockedList] = useState({})
  const [me, setMe] = useState({})

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
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    /**
     * 
     * @param {Contact[]} users
     */
    function onContactsReceived(users) {
      console.log("users.length", users.length)
      // TODO: move 'setMe' to separate handler
      setMe(prev => {
        const result = users.find(user => user._id === sessionStorage['id']) ?? prev
        setBlockedList(prev => result.blockedList ?? prev)
        return result
      })
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
          // unless this we are in an update phase...
          // setMessageGroups(prevGroups => ({ ...prevGroups, [chat._id]: (prevGroups[chat._id] ?? []) }))

          socket.emit("messages:get", chat._id) //, groupsMessagesStore[group._id].length)
          // TODO: should blocked chats be displayed?
          if (chat.type === 'private') {
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

        if (clientOffset <= serverOffset) {
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
     * @param {Chat} group 
     */
    function onGroupJoin(group) {
      // Refresh all groups and all messages:
      // socket.emit('groups:getAllUser') // all details with groups
      //OR
      const groupId = group._id
      console.log("invited to join group:", groupId)
      if (!groups.find(g => g._id == groupId) || !Object.keys(messageGroups).includes(groupId)) {
        // TODO: replace group state to object instead of array
        setGroupChats(prev => [...prev.filter(g => g._id != group._id), group])
        setMessageGroups(prev => ({ ...prev, [groupId]: [] }))
        socket.emit('group:user-join', groupId)
        console.log("accepted invitation to join group:", groupId)
      }
      else {
        console.log('already in group', groupId)
      }
    }

    function onGroupLeave(groupId) {
      console.log("removed from group:", groupId)
      let remainingGroups = groups.filter(g => g._id == groupId)
      setGroupChats(remainingGroups)
      socket.emit('group:user-leave', groupId)
      console.log("sent request to leave group:", groupId)
      if (location.pathname.endsWith(groupId)) {
        navigate('/')
      }
    }

    function onGroupsLeave(groupIds) {
      console.log("removed from groups:", groupIds)
      let remainingGroups = groups.filter(g => !groupIds.includes(g._id))
      //FIXME: groups is empty - why???
      //TODO: make sure on refresh the groups will not reconnect - will stay blocked!
      setGroupChats(remainingGroups)
      for (const groupId of groupIds) {
        if (location.pathname.endsWith(groupId)) {
          navigate('/')
          return
        }
      }
    }

    function onChatRedirection(groupId) {
      navigate('/contact/' + groupId)
    }

    // TODO: move 'setMe' to separate handler
    /**
     * 
     * @param {Contact[]} blockedContacts 
     */
    function onContactBlocked(blockedContacts) {
      setBlockedList(blockedContacts)
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('contacts:received', onContactsReceived);
    socket.on('contact:blocked', onContactBlocked);
    socket.on('group:joined', onGroupJoin);
    socket.on('group:removed', onGroupLeave);
    socket.on('chats:received', onChatsReceived);
    socket.on('message:received', onMessageReceived);
    socket.on('chat:redirect', onChatRedirection);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('contacts:received', onContactsReceived);
      socket.off('group:joined', onGroupJoin);
      socket.off('group:removed', onGroupLeave);
      socket.off('message:received', onMessageReceived);
      socket.off('groups:received', onChatsReceived);
      socket.off('chat:redirect', onChatRedirection);
      socket.off('contact:blocked', onContactBlocked);
      socket.disconnect()
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, contacts, groups, messageGroups }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };