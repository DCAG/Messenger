import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useSocket from '../utils/useSocket'

function NewChat() {
  const {contacts:socketContacts, groups} = useSocket() // [{id,username},...]
  const [contacts,setContacts] = useState([]) // ['a':[{id,username},...],...]
  const navigate = useNavigate()

  const groupContactsByFirstLetter = (contacts = []) => {
    return Object.groupBy(
      contacts.sort((a, b) => a.username.localeCompare(b.username)),
      (item) => item.username[0]
    ) 
  }

  useEffect(()=>{ 
    const otherContacts = socketContacts.filter(contact=>contact._id != sessionStorage['_id'])
    const sortedContacts = groupContactsByFirstLetter(otherContacts)
    setContacts(prev => sortedContacts??prev)
  },[socketContacts])

  const handleAnchorLink = (e) => {
    e.preventDefault()
    const pathname = e.target.pathname
    const matches = /\/contact\/new\/(?<contactId>.+?)\/(?<contactUsername>.+?)$/.exec(pathname)
    const contactId = matches.groups.contactId
    const contactUsername = matches.groups.contactUsername
    const existingGroup = groups.find(g=>g.type =='contact' && g?.members.some(m=>m._id==contactId))
    if(existingGroup){
      const existingGroupId = existingGroup._id
      navigate('/contact/' + existingGroupId)
    }
    else{
      // NOTE: new group will be created once the first message is sent. (and not here)
      // NOTE: /contact/ is temporary location for empty chats that groups were not yet created for them.
      // NOTE: once message was sent, a new group will be created, the parties will join and an instruction for redirection will be sent
      //navigate('/contact/new/' + contactId + '/' + contactUsername)
      navigate(pathname)
    }
  }

  return (
    <div className='chat-window--area'>
      <h4>New Chat</h4>
      <h4>Select Contact</h4>
      <div className='new-chat--groupby'>
        {
          contacts && Object.keys(contacts).map(firstLetter => {
            return ( 
              <div key={firstLetter}>
                <p>{firstLetter}</p>
                <div className='new-chat--contacts'>
                  {
                    contacts[firstLetter].map(contact => {
                      return (
                        <a key={contact._id} href={'/contact/new/' + contact._id + '/' + contact.username} onClick={handleAnchorLink}>{contact.username}</a>
                        // <Link key={contact._id} to={'/contact/' + contact._id}></Link>
                      )
                    })
                  }
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default NewChat