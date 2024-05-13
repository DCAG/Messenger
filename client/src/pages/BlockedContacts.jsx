import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GroupMembersInput from '../components/GroupMembersInput'

function BlockedContacts() {
  const [blockedList, setBlockedList] = useState([])
  const navigate = useNavigate()
  const contacts = [
    { id: '1', name: 'Amir' },
    { id: '2', name: 'Alice' },
    { id: '3', name: 'Julia' },
    { id: '4', name: 'Eitan' },
  ]

  const handleChange = (e) => {
    setBlockedList(e)
    //update...
  }

  return (
    <div className='chat-window--area'>
      <h4>Blocked Contacts</h4>
      <GroupMembersInput className="blocked-contacts--form" allKV={contacts} selectedKV={blockedList} onChange={handleChange} />
    </div>
  )
}

export default BlockedContacts