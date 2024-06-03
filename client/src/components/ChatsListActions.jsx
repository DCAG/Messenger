import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ChatsListActions({onFilterChange}) {
  const [filterValue, setFilterValue] = useState('')
  const navigate = useNavigate()
  const handleChange = (e) => {
    setFilterValue(e.target.value)
    onFilterChange(e)
  }

  return (
    <div className='chat-list--actions'>
    <select value={filterValue} onChange={handleChange}>
      <option value="" disabled>Filter By</option>
      <option value="">Show All</option>
      <option value="group">Groups</option>
      {/* contacts are private-chats here */}
      <option value="private">Contacts</option> 
      <option value="online">Online</option> 
    </select>
    <button onClick={()=>navigate('group/new')}>New Group</button>
    <button onClick={()=>navigate('private/new')}>New Private Chat</button>
  </div>
  )
}

export default ChatsListActions