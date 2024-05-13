import React, {useEffect, useState} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GroupMembersInput from '../components/GroupMembersInput'

function NewEditGroup() {
  const {id} = useParams()
  const emptyGroup = {name:'',members:[]}
  const [group, setGroup] = useState(emptyGroup)
  // NOTE: in case moving from edit group to a new group - since this is the same component - the state must change to an empty object
  useEffect(() => {
    console.log("useEffect - id",id)
    setGroup(prev => id!==undefined?({name: 'Beit-Beit', members: [
      { id: '1', name: 'Amir' },
      { id: '2', name: 'Alice' },
      { id: '3', name: 'Julia' },
    ]}):emptyGroup)
  },[id])
  const navigate = useNavigate()
  const contacts = [
    { id: '1', name: 'Amir' },
    { id: '2', name: 'Alice' },
    { id: '3', name: 'Julia' },
    { id: '4', name: 'Eitan' },
  ]
  
  const handleSubmit = (e) => {
    e.preventDefault()
    // navigate('/')
    console.log('saved group changes: ',group)
  }
  console.log(id)
  return (
    <div className='chat-window--area'>
      <h4>{id?"Edit " + group.name:"New Group"}</h4>
      <form className='new-editgroup-form' onSubmit={handleSubmit}>
        <div className='new-editgroup-form--fields'>
          <label htmlFor="name">Name </label> <input type="text" name="name" value={group.name} onChange={e=>setGroup(prev=>({...prev, name: e.target.value}))} />
          <label htmlFor="contacts">Contacts </label>
          <GroupMembersInput className="new-editgroup-form--members" allKV={contacts} selectedKV={group.members} onChange={e=>setGroup(prev => {return {...prev, members: e}})} />
        </div>
        <div>
          <button type="submit">{id?"Save":"Create Group"}</button>
        </div>
      </form>
    </div>
  )
}

export default NewEditGroup