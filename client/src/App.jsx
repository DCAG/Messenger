import './App.css'
import { Route, Routes, Navigate } from 'react-router-dom'
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
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/chats" />} />
        <Route path='/chats' element={<Base />}>
          {/* general schema: :type/:id */}
          <Route path='group/new' element={<NewEditGroup />} />
          <Route path='group/:id' element={<Chat />} />
          <Route path='group/:id/edit' element={<NewEditGroup />} />
          <Route path='private/new' element={<NewChat />} />
          <Route path='private/new/:contactId' element={<Chat />} />
          <Route path='private/:id' element={<Chat />} />
          <Route path='profile/blocked' element={<BlockedContacts />} />
          <Route path='server' element={<ChatServer />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
