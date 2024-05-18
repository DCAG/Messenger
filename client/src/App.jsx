import { useState } from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Base from './pages/Base'
import Chat from './pages/Chat'
import Login from './pages/Login'
import NewEditGroup from './pages/NewEditGroup'
// import NewGroup from './pages/NewGroup'
import NewChat from './pages/NewChat'
import BlockedContacts from './pages/BlockedContacts'

// import {socket} from './socket'

function App() {
    // const [isConnected, setIsConnected] = useState(socket.connected);
    // const [fooEvents, setFooEvents] = useState([]);
  
    // useEffect(() => {
    //   function onConnect() {
    //     setIsConnected(true);
    //   }
  
    //   function onDisconnect() {
    //     setIsConnected(false);
    //   }
  
    //   function onFooEvent(value) {
    //     setFooEvents(previous => [...previous, value]);
    //   }
  
    //   socket.on('connect', onConnect);
    //   socket.on('disconnect', onDisconnect);
    //   socket.on('foo', onFooEvent);
  
    //   return () => {
    //     socket.off('connect', onConnect);
    //     socket.off('disconnect', onDisconnect);
    //     socket.off('foo', onFooEvent);
    //   };
    // }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Base />}>
          <Route path=":id" element={<Chat />} />
          <Route path='newgroup' element={<NewEditGroup />} />
          <Route path=':id/editgroup' element={<NewEditGroup />} />
          <Route path='newchat' element={<NewChat />} />
          <Route path='blockedContacts' element={<BlockedContacts />} />
        </Route>
        <Route path="/Login" element={<Login />} />
      </Routes>
    </>
  )
}

export default App
