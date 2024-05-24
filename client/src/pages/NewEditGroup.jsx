import React, {useEffect, useState} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GroupMembersInput from '../components/GroupMembersInput'
import useSocket from '../utils/useSocket'

function NewEditGroup() {
  const {id} = useParams()
  const emptyGroup = {name:'',members:[]}
  const [group, setGroup] = useState(emptyGroup)
  const {socket, contacts, groups} = useSocket()
  
  // NOTE: in case moving from edit group to a new group (rerendering the component from the state of "edit group" to "new group" - this can happen during simple navigation)
  // since this is the same component - the state must change to an empty object
  
  useEffect(() => {
    setGroup(groups.find(g=>g._id==id)??emptyGroup)
  },[id,groups])

  const navigate = useNavigate()
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if(e.nativeEvent.submitter.id == "submitNewGroupForm"){
      console.log('saved group changes: ',group)
      const groupObj = {
        ...group,
        description: group.name,
        // NOTE: Add this user to the group
        members: group.members.map(i=>i._id).concat([sessionStorage['id']])
      }
      if(!id){
        socket.emit("group:create", groupObj)
      }
      else{
        socket.emit("group:edit", groupObj)
      }
      navigate('/group/'+id)
    }
  }
  
  const prepareContactsKeyValuePairs = () => {
    return contacts
      // remove current user from available contacts - user cannot remove himself from a group using this form. (he can click on "leave group" instead)
      // user is always part of groups he is creating (they are added back on submit).
      .filter(c=>c._id!=sessionStorage['id'])
      // converting to supported object structure by this component
      .map(c => ({id: c._id, name: c.username}))
  }

  const prepareSelectedKeyValuePairs = () => {
    return group.members
      // remove current user from available contacts - user cannot remove himself from a group using this form. (he can click on "leave group" instead)
      // user is always part of groups he is creating (they are added back on submit).
      .filter(c=>c._id != sessionStorage['id'])
      // converting to supported object structure by this component
      .map(c => ({id: c._id, name: c.username}))
  }

  const handleGroupMembersChange = (groupMembersKV) => {
    return setGroup(prev =>
      ({
        ...prev,
        members: groupMembersKV.map(m=>({_id:m.id, username:m.name}))
      })
    )
  }

  return (
    <div className='chat-window--area'>
      <h4>{id?"Edit " + group.name:"New Group"}</h4>
      <form className='new-editgroup-form' onSubmit={handleSubmit}>
        <div className='new-editgroup-form--fields'>
          <label htmlFor="name">Name </label> <input type="text" name="name" value={group.name} onChange={e=>setGroup(prev=>({...prev, name: e.target.value}))} />
          <label htmlFor="contacts">Contacts </label>
          <GroupMembersInput
            className="new-editgroup-form--members"
            allKV={prepareContactsKeyValuePairs()}
            selectedKV={prepareSelectedKeyValuePairs()}
            onChange={handleGroupMembersChange} />
        </div>
        <div>
          <button id='submitNewGroupForm' type="submit">{id?"Save":"Create Group"}</button>
        </div>
      </form>
    </div>
  )
}

export default NewEditGroup