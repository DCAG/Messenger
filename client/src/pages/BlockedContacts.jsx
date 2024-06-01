import React, { useEffect, useState } from 'react'
import GroupMembersInput from '../components/GroupMembersInput'
import useSocket from '../utils/useSocket'

function BlockedContacts() {
  // blockedList is updated on event in socket context
  const {blockedList, contacts, socket} = useSocket()
  const [blockedListKV, setBlockedListKV] = useState([])

  useEffect(() => {
    setBlockedListKV(prev => {
      return blockedList.map(contactId => {
        const {id, username: name} = contacts[contactId]
        return {id, name}
      })??prev
    })
  },[blockedList])

  const handleChange = (selectedKV) => {
    const contactsIds = selectedKV.map(m=>m.id)
    socket.emit('contacts:update:blocked',[].concat(contactsIds))
  }

  const prepareContactsKeyValuePairs = () => {
    return Object.values(contacts)
      // remove current user from available contacts - user cannot block himself.
      .filter(c=>c._id!=sessionStorage['id'])
      // converting to supported object structure by this component
      .map(c => ({id: c._id, name: c.username}))
  }

  // const prepareSelectedKeyValuePairs = () => {
  //   return blockedList
  //     // converting to supported object structure by this component
  //     .map(c => ({id: c._id, name: c.username}))
  // }

  return (
    <div className='chat-window--area'>
      <h4>Blocked Contacts</h4>
      <GroupMembersInput
        className="blocked-contacts--form"
        allKV={prepareContactsKeyValuePairs()}
        selectedKV={blockedListKV}
        onChange={handleChange}
      />
    </div>
  )
}

export default BlockedContacts