import React from 'react'
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
  // const chatsList = [
  //   {id: '1', type: 'contact', name: 'Alice'},
  //   {id: '2', type: 'contact', name: 'Julia'},
  //   {id: '3', type: 'group', name: 'Beit-Beit'},
  //   {id: '4', type: 'group', name: 'Bnei Dodim'},
  //   {id: '5', type: 'contact', name: 'Eitan'},
  //   {id: '6', type: 'contact', name: 'Dafna'},
  //   {id: '7', type: 'contact', name: 'Alice'},
  //   {id: '8', type: 'contact', name: 'Julia'},
  //   {id: '9', type: 'group', name: 'Beit-Beit'},
  //   {id: '10', type: 'group', name: 'Bnei Dodim'},
  //   {id: '11', type: 'contact', name: 'Eitan'},
  //   {id: '12', type: 'contact', name: 'Dafna'},
  // ]
  const handleFilter = () => {
    
  }
  return (
    <div>
      <h4 className='chat-list--header'>
      Chats
      </h4>
      <div className='chat-list--actions'>
        <select value={""} onChange={handleFilter}>
          <option value="" disabled>Filter By</option>
          <option value="all">Show All</option>
          <option value="unread">Unread</option>
          <option value="groups">Groups</option>
          <option value="contacts">Contacts</option>
        </select>
        <button onClick={e=>navigate('/group/new')}>New Group</button>
        <button onClick={e=>navigate('/contact/newchat')}>New Chat</button>
      </div>

      <ul className='chat-list'>
        {
          chatsList && chatsList.map(chatItem => {
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
      {}
    </div>
  )
}

export default ChatsList