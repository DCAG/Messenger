import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import useSocket from '../utils/useSocket'
import ChatsListActions from './ChatsListActions'
import { CHAT_IMG } from '../utils/images'
import '../utils/types'


function ChatsList({ onNavigation }) {
  const { chats, onlineContacts } = useSocket()
  const [chatsFilter, setChatsFilter] = useState('')

  const handleFilter = (e) => {
    setChatsFilter(e.target.value)
  }

  const chatFilter = function (id) {
    if (chatsFilter === 'online') {
      return onlineContacts[chats[id]?.privateChatContactId]
    }
    return !chatsFilter || chats[id].type == chatsFilter
  }

  return (
    <div className='chat-list__container'>
      <h1 className='chat-list__header'>
        Chats
      </h1>
      <ChatsListActions onFilterChange={handleFilter} onNavigation={onNavigation} />

      <ul className='chat-list__items'>
        {
          Object.keys(chats).filter(chatFilter).map(id => {
            const chat = chats[id]
            return (
              <li key={chat._id} className='chat-item'>
                <Link to={chat.type + '/' + chat._id} onClick={() => onNavigation()}>
                  <img src={CHAT_IMG[chat.type]} className={`chat-item__icon${onlineContacts[chat.privateChatContactId] ? ' online' : ''}`} alt={`${chat.type} image`} />
                  <span>
                    {
                      // NOTE: property 'privateChatName' was added in socketContext.jsx
                      chat.type === 'private' ? `${chat.privateChatName}${onlineContacts[chat.privateChatContactId] ? ' (online)' : ''}` : (chat.type === 'group' ? chat.name : ':unknown:')
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