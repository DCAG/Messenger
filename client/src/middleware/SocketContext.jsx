// ref: https://dev.to/stephengade/build-custom-middleware-for-a-reactnextjs-app-with-context-api-2ed3
import React, { createContext, useState, useEffect } from "react";
import io from "socket.io-client";

const SOCKET_URL = 'http://localhost:3000/'

const getSocket = () => {
  const token = sessionStorage['accessToken'];
  if (token) {
    return io.connect(SOCKET_URL, {
      auth: { token }
    });
  }
  return io.connect(SOCKET_URL);
};
const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const socket = getSocket();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [contacts, setContacts] = useState([])
  const [groups, setGroups] = useState([])

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      socket.emit('contacts:getAll')
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onContactsReceived(users) {
      setContacts(users)
      console.log("contacts.length",contacts.length)
      console.log("users.length",users.length)
    }

    function onGroupJoin(groupId) {
      console.log("invited to join group:", groupId)
      socket.emit('group:user-join', groupId)
      console.log("accepted invitation to join group:", groupId)
    }

    function onChatMessage(payload) {
      console.log("accepted message:", payload)
      alert(payload)
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('contacts:received', onContactsReceived);
    socket.on('group:invite', onGroupJoin);
    socket.on('chat:message', onChatMessage);
    
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('contacts:received', onContactsReceived);
      socket.off('group:invite', onGroupJoin);
      socket.off('chat:message', onChatMessage);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: getSocket(), isConnected, contacts }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };