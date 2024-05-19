import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useSocket from '../utils/useSocket'

function NewChat() {
  const {contacts:socketContacts} = useSocket() // [{id,username},...]
  const [contacts,setContacts] = useState([]) // ['a':[{id,username},...],...]

  const groupContactsByFirstLetter = (contacts = []) => {
    return Object.groupBy(
      contacts.sort((a, b) => a.username.localeCompare(b.username)),
      (item) => item.username[0]
    ) 
  }

  useEffect(()=>{ 
    const sortedContacts = groupContactsByFirstLetter(socketContacts)
    setContacts(prev => sortedContacts??prev)
  },[socketContacts])

  return (
    <div className='chat-window--area'>
      <h4>New Chat</h4>
      <h4>Select Contact</h4>
      <div className='new-chat--groupby'>
        {
          contacts && Object.keys(contacts).map(firstLetter => {
            return ( 
              <div>
                <p>{firstLetter}</p>
                <div className='new-chat--contacts'>
                  {
                    contacts[firstLetter].map(contact => {
                      return (
                        <Link key={contact.id} to={'/' + contact.id}>{contact.username}</Link>
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