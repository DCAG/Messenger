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

function App() {
  sessionStorage['username'] = 'Amir'
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
