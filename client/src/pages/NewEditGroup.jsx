import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GroupMembersInput from '../components/GroupMembersInput'
import useSocket from '../utils/useSocket'

function NewEditGroup() {
  const { id } = useParams()
  const { socket, contacts, chats } = useSocket()
  const emptyGroup = { _id: '', name: '', type: 'group', description: '', members: [] }
  const [chat, setChat] = useState(chats[id] ?? emptyGroup)
  const navigate = useNavigate()

  // NOTE: in case moving from edit group to a new group (rerendering the component from the state of "edit group" to "new group" - this can happen during simple navigation)
  // since this is the same component - the state must change to an empty object

  useEffect(() => {
    setChat(chats[id] ?? emptyGroup)
  }, [id, chats])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (e.nativeEvent.submitter.id == "submitNewGroupForm") {
      console.log('saved group changes: ', chat)
      const groupObj = {
        ...chat,
        description: chat.name,
        // NOTE: Add current user to the group
        members: chat.members.map(i => i._id).concat([sessionStorage['id']])
      }
      if (!id) {
        socket.emit("chat:group:create", groupObj)
      }
      else {
        socket.emit("chat:group:edit", groupObj)
      }
      navigate('/chats/group/' + id)
    }
  }

  const prepareContactsKeyValuePairs = () => {
    if (Object.keys(contacts).length) {
      const myContacts = { ...contacts }
      // remove current user from available contacts - user cannot remove himself from a group using this form. (he can click on "leave group" instead)
      // user is always part of groups he is creating (they are added back on submit).
      // delete myContacts[sessionStorage['id']]
      // converting to supported object structure by this component
      return Object.values(myContacts).map(c => ({ id: c._id, name: c.username }))
    }
    return []
  }

  const prepareSelectedKeyValuePairs = () => {
    return chat.members
      // remove current user from available contacts - user cannot remove himself from a group using this form. (he can click on "leave group" instead)
      // user is always part of groups he is creating (they are added back on submit).
      .filter(c => c._id != sessionStorage['id'])
      // converting to supported object structure by this component
      .map(m => ({ id: m._id, name: m.username }))
  }

  const handleGroupMembersChange = (membersKV) => {
    return setChat(prev =>
    ({
      ...prev,
      members: membersKV.map(m => ({ _id: m.id, username: m.name }))
    })
    )
  }

  const handleGroupNameChange = e => setChat(prev => ({ ...prev, name: e.target.value }))

  return (
    <div className='main__container'>
      <h4>{id ? "Edit " + chat?.name : "New Group"}</h4>
      <form className='new-editgroup-form' onSubmit={handleSubmit}>
        <div className='new-editgroup-form__fields'>
          <label htmlFor="name">Name </label> <input type="text" name="name" value={chat?.name} onChange={handleGroupNameChange} />
          <label htmlFor="contacts">Contacts </label>
          <GroupMembersInput
            className="new-editgroup-form__members"
            allKV={prepareContactsKeyValuePairs()}
            selectedKV={prepareSelectedKeyValuePairs()}
            onChange={handleGroupMembersChange} />
        </div>
        <div>
          <button id='submitNewGroupForm' type="submit">{id ? "Save" : "Create Group"}</button>
        </div>
      </form>
    </div>
  )
}

export default NewEditGroup