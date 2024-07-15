import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ChatsListActions({ onFilterChange, onNavigation }) {
  const [filterValue, setFilterValue] = useState('')
  const navigate = useNavigate()
  const handleChange = (e) => {
    setFilterValue(e.target.value)
    onFilterChange(e)
  }

  return (
    <div className='chat-list__actions'>
      <button onClick={() => { navigate('group/new'); onNavigation() }}>New Group</button>
      <button onClick={() => { navigate('private/new'); onNavigation() }}>New Chat</button>
      <select value={filterValue} onChange={handleChange}>
        <option value="" disabled>Filter By</option>
        <option value="">Show All</option>
        <option value="group">Groups</option>
        {/* contacts are private-chats here */}
        <option value="private">Contacts</option>
        <option value="online">Online</option>
      </select>
    </div>
  )
}

export default ChatsListActions