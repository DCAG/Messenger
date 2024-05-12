import React from 'react'
import { Link } from 'react-router-dom'
import groupLogo from '../assets/group-small.png'
import contactLogo from '../assets/contact-small.png'


const CHAT_TYPES = {
  'contact':contactLogo,
  'group':groupLogo,
}

function ChatsList() {
  const chatsList = [
    {id: '1', type: 'contact', name: 'Alice'},
    {id: '2', type: 'contact', name: 'Julia'},
    {id: '3', type: 'group', name: 'Beit-Beit'},
    {id: '4', type: 'group', name: 'Bnei Dodim'},
    {id: '5', type: 'contact', name: 'Eitan'},
    {id: '6', type: 'contact', name: 'Dafna'},
  ]
  return (
    <div className='chat-list--area'>
      <h4 className='chat-list--header'>
      Chats
      </h4>
      <ul className='chat-list'>
        {
          chatsList.map(chatItem => {
            return (
              <li key={chatItem.id} className='chat-item'>
                <Link to={chatItem.id}>
                  <img src={CHAT_TYPES[chatItem.type]} style={{width:'32px'}} alt={`${chatItem.type} image`} />
                  <span>
                  {chatItem.name}
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