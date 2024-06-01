import React from 'react'
import ChatsList from '../components/ChatsList'
import { Outlet } from 'react-router-dom'
import ProfileMenu from '../components/ProfileMenu'

function Base() {
  return (
    <div className='grid-container'>
      <div className='chat-list--area'>
        <ChatsList />
        <ProfileMenu />
      </div>
      <Outlet />
    </div>
  )
}

export default Base