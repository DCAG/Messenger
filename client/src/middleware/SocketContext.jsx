// ref: https://dev.to/stephengade/build-custom-middleware-for-a-reactnextjs-app-with-context-api-2ed3
import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {socket} from '../utils/socket'
import useAuth from "../utils/useAuth";

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const {isAuthenticated} = useAuth()
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [contacts, setContacts] = useState([])
  const [groups, setGroups] = useState([])
  const [groupMessages, setGroupMessages] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const token = sessionStorage['accessToken'];
    if(!isConnected && isAuthenticated && token){
      socket.auth = {token}
      socket.connect()
    }

    function onConnect() {
      setIsConnected(true);
      socket.emit('contacts:getAll')
      socket.emit('groups:getAllUser') // all details with groups
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onContactsReceived(users) {
      setContacts(users)
      console.log("contacts.length",contacts.length)
      console.log("users.length",users.length)
    }

    function onGroupsReceived(myGroups) {
      setGroups(myGroups)
      // update Groups Messages placeholder
      const groupsMessagesStore = {...groupMessages}
      myGroups.forEach(group => {
        groupsMessagesStore[group._id] = groupMessages[group._id]??[]
        // join room on the server and retreives all the messages
        socket.emit("group:user-join", group._id, groupsMessagesStore[group._id].length)
        //socket.emit('chat:fetch',[group._id])
      })
      setGroupMessages(groupsMessagesStore)
      console.log("groups.length", groups.length)
      console.log("myGroups.length", myGroups?.length)
    }

    function onGroupJoin(group) {
      // Refresh all groups and all messages:
      // socket.emit('groups:getAllUser') // all details with groups
      //OR
      const groupId = group._id
      console.log("invited to join group:", groupId)
      if(!groups.find(g=>g._id==groupId) || !Object.keys(groupMessages).includes(groupId)){
        // TODO: replace group state to object instead of array
        setGroups(prev => [...prev.filter(g=>g._id!=group._id), group])
        setGroupMessages(prev => ({...prev, [groupId]:[]}))
        socket.emit('group:user-join', groupId)
        console.log("accepted invitation to join group:", groupId)
      }
      else{
        console.log('already in group', groupId)
      }
    }

    function onGroupLeave(groupId) {
      console.log("removed from group:", groupId)
      let a = groups.filter(g=>g._id==groupId)
      setGroups(a)
      socket.emit('group:user-leave', groupId)
      console.log("sent request to leave group:", groupId)
      if(location.pathname.endsWith(groupId)){
        navigate('/')
      }
    }

    function onChatMessage(payload) {
      // console.log("accepted message:", payload)
      setGroupMessages(prev => {
        //console.log("GroupMessages:",prev)
        return {
          ...prev,
          [payload.groupId]: [
            ...prev[payload.groupId]??[],
            {
              id: payload.id,
              sender: payload.senderId, // TODO: replace with username
              message: payload.content
            }
          ]
        }
      })
      //alert(payload)
    }

    function onChatRedirection(groupId){
      navigate('/contact/' + groupId)
    }

    // socket.io.on("reconnect_attempt", () => {
    //   console.log('reconnect_attempt')
    //   if(isAuthenticated && sessionStorage['accessToken']){
    //     socket.io.opts.query.token = sessionStorage['accessToken'];
    //     socket.auth = {token: sessionStorage['accessToken']}
    //   }
    // });

    // socket.on("connect_error", (err) => {
    //   console.log('connect_error')
    //   if (err.message === "invalid credentials" && isAuthenticated) {
    //     socket.auth = {token: sessionStorage["accessToken"]}
    //     socket.connect();
    //   }
    // });

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('contacts:received', onContactsReceived);
    socket.on('group:invite', onGroupJoin);
    socket.on('group:leave', onGroupLeave);
    socket.on('chat:message', onChatMessage);
    socket.on('message:received', onChatMessage);
    socket.on('groups:received', onGroupsReceived);
    socket.on('chat:redirect', onChatRedirection);
    
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('contacts:received', onContactsReceived);
      socket.off('group:invite', onGroupJoin);
      socket.off('group:leave', onGroupLeave);
      socket.off('chat:message', onChatMessage);
      socket.off('message:received', onChatMessage);
      socket.off('groups:received', onGroupsReceived);
      socket.off('chat:redirect', onChatRedirection);
      socket.disconnect()
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, contacts, groups, groupMessages }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };