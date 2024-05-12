import { useState } from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Base from './pages/Base'
import Chat from './pages/Chat'
import Login from './pages/Login'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Base />}>
          <Route path=":id" element={<Chat />} />
        </Route>
        <Route path="/Login" element={<Login />} />
      </Routes>
    </>
  )
}

export default App
