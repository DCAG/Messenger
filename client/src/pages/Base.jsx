import React from 'react'
import ChatsList from '../components/ChatsList'
import { Outlet } from 'react-router-dom'
import ProfileMenu from '../components/ProfileMenu'
import useSocket from '../utils/useSocket'
import Toast from '../components/Toast'

function Base() {
  const {toast} = useSocket()

  return (
    <div className='grid-container'>
      <div className='chat-list--area'>
        <ChatsList />
        <ProfileMenu />
      </div>
      <Outlet />
      <Toast
        payload={toast.payload}
        show={toast.show}
        type={toast.type}
      />
    </div>
  )
}

export default Base