import { useState, useEffect } from 'react'
import { CHAT_IMG } from '../utils/images'
import { useNavigate } from 'react-router-dom'
import useSocket from '../utils/useSocket'

function ChatHeader({ chat }) {
  const navigate = useNavigate()
  const { socket, blockedList } = useSocket()
  const [chatName, setChatName] = useState(':init:')
  const [statusText, setStatusText] = useState('')
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    setIsBlocked(chat?.privateChatContactId && blockedList.includes(chat.privateChatContactId))
  }, [chat, blockedList])

  useEffect(() => {
    if (chat) {
      setChatName(getChatName(chat))
      // FUTURE: statusText will present if someone is typing...
      setStatusText(getStatusText(chat))
    }
  }, [chat, isBlocked])

  /**
   * 
   * @param {Chat} chat 
   * @returns 
   */
  const getChatName = (chat) => {
    switch (chat.type) {
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

  /**
   * 
   * @param {Chat} chat 
   * @returns 
   */
  const getStatusText = (chat) => {
    if (chat.type === 'private' && isBlocked) {
      return '-- BLOCKED --'
    }

    if (chat.type !== 'group') {
      return ''
    }

    // in a group: present list of members
    const members = chat.members.map(m => m.username)
    const eachLimit = 6;
    let lengthLimit = 20;
    let result = []
    let i = 0;
    while (lengthLimit > 0 && members.length > i) {
      if (members[i].length > eachLimit) {
        result.push(members[i].substr(0, eachLimit) + '-')
        lengthLimit -= eachLimit
      }
      else {
        result.push(members[i])
        lengthLimit -= members[i].length
      }
      i++
    }
    return "Members: " + result.join(', ') + (lengthLimit <= 0 ? '...' : '')
  }

  const editGroup = () => {
    navigate(`group/${id}/edit`)
  }

  const leaveGroup = () => {
    // TODO: draw the entire flow
    socket.emit("chat:group:leave")
  }

  const blockUnblockContact = () => {
    // TODO: draw the entire flow
    if (chat.type === 'private') {
      const contactId = chat.privateChatContactId
      if(!isBlocked){
        socket.emit('contacts:update:blocked', blockedList.concat(contactId))
      }
      else{
        socket.emit('contacts:update:blocked', blockedList.filter(blockedId => blockedId!==contactId))
      }
    }
  }

  return (
    <div className='chat-window--header'>
      <div className='chat-window--header-info'>
        {/* TODO: replace style with className */}
        <img src={CHAT_IMG[chat?.type]} style={{ width: '32px' }} alt={`${chat?.type} image`} />
        <span>
          {chatName}
        </span>
        <div>
          <span id="chatStatusText">
            {statusText}
          </span>
        </div>
      </div>
      <div className="chat-window--header-actions">
        <button style={chat?.type === 'group' ? {} : { display: 'none' }} onClick={editGroup}>Edit Group</button>
        <button style={chat?.type === 'group' ? {} : { display: 'none' }} onClick={leaveGroup}>Leave Group</button>
        <button style={chat?.type === 'private' ? {} : { display: 'none' }} onClick={blockUnblockContact}>{!isBlocked?'Block':'Unblock'}</button>
      </div>
    </div>
  )
}

export default ChatHeader