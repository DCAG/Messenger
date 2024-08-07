import React, { useEffect, useState } from 'react'
import GroupMembersInput from '../components/GroupMembersInput'
import useSocket from '../utils/useSocket'

function BlockedContacts() {
  // blockedList is updated on event in socket context
  const { blockedList, contacts, socket } = useSocket()
  const [blockedListKV, setBlockedListKV] = useState([])

  useEffect(() => {
    setBlockedListKV(prev => {
      return blockedList.map(contactId => {
        const { id, username: name } = contacts[contactId]
        return { id, name }
      }) ?? prev
    })
  }, [blockedList])

  const handleChange = (selectedKV) => {
    const contactsIds = selectedKV.map(m => m.id)
    socket.emit('contacts:blocked:update', [].concat(contactsIds))
  }

  const prepareContactsKeyValuePairs = () => {
    return Object.values(contacts)
      // converting to supported object structure by this component
      .map(c => ({ id: c._id, name: c.username }))
  }

  return (
    <div className='main__container'>
      <h4>Blocked Contacts</h4>
      <GroupMembersInput
        className="blocked-contacts__form"
        allKV={prepareContactsKeyValuePairs()}
        selectedKV={blockedListKV}
        onChange={handleChange}
      />
    </div>
  )
}

export default BlockedContacts