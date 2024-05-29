import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import groupLogo from '../assets/group-small.png'
import contactLogo from '../assets/contact-small.png'
import useSocket from '../utils/useSocket'


const CHAT_TYPES = {
  'contact':contactLogo,
  'group':groupLogo,
}

function ChatsList() {
  const navigate = useNavigate()
  const {groups:chatsList} = useSocket() // [{_id, type, name, description, members: []}]
  const [chatsFilter, setChatsFilter] = useState('')
  const handleFilter = (e) => {
    setChatsFilter(e.target.value)
  }
  const filterChat = (chat) => {
    return !chatsFilter || chat.type==chatsFilter
  }
  return (
    <div>
      <h4 className='chat-list--header'>
      Chats
      </h4>
      <div className='chat-list--actions'>
        <select value={""} onChange={handleFilter}>
          <option value="" disabled>Filter By</option>
          <option value="">Show All</option>
          <option value="group">Groups</option>
          <option value="contact">Contacts</option>
        </select>
        <button onClick={()=>navigate('/group/new')}>New Group</button>
        <button onClick={()=>navigate('/contact/newchat')}>New Chat</button>
      </div>

      <ul className='chat-list'>
        {
          chatsList && chatsList.filter(filterChat).map(chatItem => {
            return (
              <li key={chatItem._id} className='chat-item'>
                <Link to={'/' + chatItem.type + '/' + chatItem._id}>
                  <img src={CHAT_TYPES[chatItem.type]} style={{width:'32px'}} alt={`${chatItem.type} image`} />
                  <span>
                  {
                    chatItem.type == 'contact'?(chatItem.members.find(member=>member._id!=sessionStorage['id'])?.username??':error:'):(chatItem.type == 'group'?chatItem.name:':unknown:')
                  }
                  </span>
                </Link>
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}

export default ChatsList