import './App.css'
import { Route, Routes } from 'react-router-dom'
import Base from './pages/Base'
import Chat from './pages/Chat'
import ChatServer from './pages/ChatServer'
import Login from './pages/Login'
import NewEditGroup from './pages/NewEditGroup'
import NewChat from './pages/NewChat'
import BlockedContacts from './pages/BlockedContacts'

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Base />}>
          <Route path='group/new' element={<NewEditGroup />} />
          <Route path='group/:id' element={<Chat />} />
          <Route path='group/:id/edit' element={<NewEditGroup />} />
          <Route path='contact/newchat' element={<NewChat />} />
          <Route path='contact/new/:id/:name' element={<Chat />} />
          <Route path='contact/:id' element={<Chat />} />
          <Route path='server' element={<ChatServer />} />
          <Route path='blockedContacts' element={<BlockedContacts />} />
        </Route>
        <Route path="/Login" element={<Login />} />
      </Routes>
    </>
  )
}

export default App
