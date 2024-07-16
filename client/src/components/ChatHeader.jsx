import { useState, useEffect } from 'react'
import { CHAT_IMG } from '../utils/images'
import { useNavigate } from 'react-router-dom'
import useSocket from '../utils/useSocket'

function ChatHeader({ chat }) {
  const navigate = useNavigate()
  const { socket, blockedList, onlineContacts } = useSocket()
  const [chatName, setChatName] = useState(':init:')
  const [statusText, setStatusText] = useState('')
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    setIsBlocked(chat?.privateChatContactId && blockedList.includes(chat.privateChatContactId))
  }, [chat, blockedList])

  useEffect(() => {
    // FUTURE: statusText will present if someone is typing...
    setStatusText(writeStatusText)
    setChatName(writeChatName)
  }, [chat, isBlocked, onlineContacts])

  /**
   * 
   * @param {Chat} chat 
   * @returns 
   */
  const writeChatName = (prev) => {
    switch (chat?.type) {
      case 'private':
        return chat.privateChatName
      case 'group':
        return chat.name
      case 'self':
        return sessionStorage['username'] + ' (You)'
      default:
        return ':unknown:'
    }
  }

  const writeStatusText = (prev) => {
    if (chat?.type === 'private' && isBlocked) {
      return '-- BLOCKED --'
    }

    if (chat?.type !== 'group') {
      return 'Status: ' + (onlineContacts[chat?.privateChatContactId] ? 'Online' : 'Offline')
    }

    if (!chat?.members) {
      return prev
    }

    // in a group: present list of members
    const members = chat.members.map(m => m.username)
    return "Members: " + members.join(', ')
  }

  const editGroup = () => {
    navigate(`/chats/group/${chat?._id}/edit`)
  }

  const leaveGroup = () => {
    socket.emit("chat:leave", chat?._id)
  }

  const blockUnblockContact = () => {
    // TODO: draw the entire flow
    if (chat.type === 'private') {
      const contactId = chat.privateChatContactId
      if (!isBlocked) {
        socket.emit('contacts:blocked:update', blockedList.concat(contactId))
      }
      else {
        socket.emit('contacts:blocked:update', blockedList.filter(blockedId => blockedId !== contactId))
      }
    }
  }

  return (
    <div className='chat-window__header'>
      <div className='chat-window__header-info'>
        <img src={CHAT_IMG[chat?.type]} alt={`${chat?.type} image`} />
        <span>
          {chatName}
        </span>
        <span id="chatStatusText">
          {statusText}
        </span>
      </div>
      <div className="chat-window__header-actions">
        <button style={chat?.type === 'group' ? {} : { display: 'none' }} onClick={editGroup}>Edit Group</button>
        <button style={chat?.type === 'group' ? {} : { display: 'none' }} onClick={leaveGroup}>Leave Group</button>
        <button style={chat?.type === 'private' ? {} : { display: 'none' }} onClick={blockUnblockContact}>{!isBlocked ? 'Block' : 'Unblock'}</button>
      </div>
    </div>
  )
}

export default ChatHeader