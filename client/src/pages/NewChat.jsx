import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useSocket from '../utils/useSocket'

function NewChat() {
  const { contacts, privateChatsMap, onlineContacts } = useSocket()
  const [phoneBook, setPhoneBook] = useState([]) // ['a':[{id,username},...],...]
  const navigate = useNavigate()

  const groupContactsByFirstLetter = (contacts = []) => {
    return Object.groupBy(
      contacts.sort((a, b) => a.username.localeCompare(b.username)),
      (item) => item.username[0]
    )
  }

  useEffect(() => {
    if (Object.keys(contacts).length) {
      let otherContacts = { ...contacts }
      // remove self
      delete otherContacts[sessionStorage['id']]
      const sortedContactsAlpha = groupContactsByFirstLetter(Object.values(otherContacts))
      setPhoneBook(prev => sortedContactsAlpha ?? prev)
    }
  }, [contacts])

  const handleAnchorLink = (e) => {
    e.preventDefault()
    const contactId = e.target.getAttribute('data-contactid')
    const existingChat = privateChatsMap[contactId]
    if (existingChat) {
      navigate('/chats/private/' + existingChat)
    }
    else {
      /* NOTE: new group will be created once the first message is sent. (and not here)
       * private/new/:contactId is temporary location for empty chats that groups were not yet created for them.
       * once message was sent, a new group will be created, the parties will join and an instruction for redirection will be sent
       */
      navigate('/chats/private/new/' + contactId)
    }
  }

  return (
    <div className='main__container'>
      <h4>New Chat</h4>
      <h4>Select Contact</h4>
      <div className='new-chat__groupby'>
        {
          Object.keys(phoneBook).map(letter => {
            return (
              <div key={letter}>
                <p>{letter}</p>
                <div className='new-chat__contacts'>
                  {
                    phoneBook[letter].map(contact => {
                      return (
                        <a key={contact._id} data-contactid={contact._id} onClick={handleAnchorLink} className={`${onlineContacts[contact._id] ? 'online' : ''}`}>{contact.username}</a>
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