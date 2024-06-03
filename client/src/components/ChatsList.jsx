import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useSocket from '../utils/useSocket'
import ChatsListActions from './ChatsListActions'
import { CHAT_IMG } from '../utils/images'
import '../utils/types'


function ChatsList() {
  const { chats, onlineContacts } = useSocket()
  const [chatsFilter, setChatsFilter] = useState('')
  const [chatsList, setChatsList] = useState({})

  useEffect(() => {
    setChatsList(prev=>chats??prev)
  },[chats])

  const handleFilter = (e) => {
    setChatsFilter(e.target.value)
  }

  const chatFilter = function(id) {
    return !chatsFilter || chats[id].type == chatsFilter
  }

  return (
    <div>
      <h4 className='chat-list--header'>
        Chats
      </h4>
      <ChatsListActions onFilterChange={handleFilter} />

      <ul className='chat-list'>
        {
          // Object.keys(chats).length > 0 && 
          Object.keys(chatsList).filter(chatFilter).map(id => {
            const chat = chats[id]
            return (
              <li key={chat._id} className='chat-item'>
                <Link to={chat.type + '/' + chat._id}>
                  <img src={CHAT_IMG[chat.type]} className={`chat-item--icon${onlineContacts[chat.privateChatContactId]?' online':''}`} alt={`${chat.type} image`} />
                  <span>
                    {
                      /* NOTE: property 'privateChatName' was added in socketContext.jsx */
                      chat.type === 'private' ? `${chat.privateChatName}${onlineContacts[chat.privateChatContactId]?' (online)':''}` : (chat.type === 'group' ? chat.name : ':unknown:')
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