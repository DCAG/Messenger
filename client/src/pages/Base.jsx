import React from 'react'
import ChatsList from '../components/ChatsList'
import { Outlet } from 'react-router-dom'
import Profile from '../components/Profile'

function Base() {
  return (
    <div className='grid-container'>
      <div className='chat-list--area'>
      <ChatsList />
      <Profile />
      </div>
      <Outlet />
    </div>
  )
}

export default Base