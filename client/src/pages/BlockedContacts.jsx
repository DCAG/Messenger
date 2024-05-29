import React, { useEffect, useState } from 'react'
import GroupMembersInput from '../components/GroupMembersInput'
import useSocket from '../utils/useSocket'

function BlockedContacts() {
  const {blockedList: socketBlockedList, contacts, socket} = useSocket()
  const [blockedList, setBlockedList] = useState(socketBlockedList??[])

  useEffect(() => {
    setBlockedList(prev => socketBlockedList??prev)
  },[socketBlockedList])

  const handleChange = (blockedContactsKV) => {
    const blocked = blockedContactsKV.map(m=>m.id)
    socket.emit('contact:block',[].concat(blocked))
  }

  const prepareContactsKeyValuePairs = () => {
    return contacts
      // remove current user from available contacts - user cannot block himself.
      .filter(c=>c._id!=sessionStorage['id'])
      // converting to supported object structure by this component
      .map(c => ({id: c._id, name: c.username}))
  }

  const prepareSelectedKeyValuePairs = () => {
    return blockedList
      // converting to supported object structure by this component
      .map(c => ({id: c._id, name: c.username}))
  }

  return (
    <div className='chat-window--area'>
      <h4>Blocked Contacts</h4>
      <GroupMembersInput
        className="blocked-contacts--form"
        allKV={prepareContactsKeyValuePairs()}
        selectedKV={prepareSelectedKeyValuePairs()}
        onChange={handleChange}
      />
    </div>
  )
}

export default BlockedContacts