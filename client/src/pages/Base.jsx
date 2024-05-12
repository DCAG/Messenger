import React from 'react'
import ChatsList from '../components/ChatsList'
import { Outlet } from 'react-router-dom'

function Base() {
  return (
    <div className='grid-container'>
      <ChatsList />
      <Outlet />
    </div>
  )
}

export default Base