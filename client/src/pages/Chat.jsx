import React, { useState, useRef, useMemo, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import groupLogo from '../assets/group-small.png'
import contactLogo from '../assets/contact-small.png'
import useSocket from '../utils/useSocket'

const CHAT_TYPES = {
  'contact': contactLogo,
  'group': groupLogo,
}

function Chat() {
  const { groups: chatsList, socket, groupMessages } = useSocket() // [{_id, type, name, description, members: []}]
  const navigate = useNavigate()

  const someone = { id: '5', type: 'contact', name: 'Julia', isTyping: false }
  const thisUser = sessionStorage['username']
  const { id, name:newChatName } = useParams()
  const [chatName, setChatName] = useState(newChatName??":unknown:")
  const [conversation, setConversation] = useState([].concat(groupMessages[id] ?? []))
  const [chatItem, setChatItem] = useState({ id: '', name: '', type: '', members: [] })
  const [isGroupChat, setIsGroupChat] = useState(true)
  const [statusText, setStatusText] = useState('')

  const editGroup = () => {
    navigate(`/group/${id}/edit`)
  }

  const leaveGroup = () => {

  }

  const blockContact = () => {

  }


  const messageFormRef = useRef()
  const location = useLocation()
  const isNew = /new\//.test(location.pathname)
  const getChatType = () => {
    if (/contact\//.test(location.pathname)) {
      return 'contact'
    }
    return 'group'
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const chatType = getChatType()
    const message = {
      groupId: id,
      type: chatType,
      content: e.target[0].value
    }
    if (isNew) {
      socket.emit('chat:new:message', message)
    }
    else {
      socket.emit('chat:message', message)
    }
    // Send the message...
    // Reset messagebox
    messageFormRef.current.reset()
  }

  const getChatName = (chatObj) => {
    if (!chatObj) {
      return newChatName??":unknown:"
    }
    switch (chatObj.type) {
      case 'contact':
        const userId = sessionStorage['id']
        return chatObj.members.find(member => member._id != userId)?.username ?? ":unknown:"
      case 'group':
        return chatObj.name
      case 'self':
        return sessionStorage['username'] + " (You)"
      default:
        return ':unknown:'
    }
  }

  const getStatusText = (chatObj) => {
    if (false /*someone.isTyping*/) {
      return `${someone?.name} is typing...`

    }
    else if (chatObj?.type == 'group') {
      const members = chatObj.members.map(m => m.username)
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
    else {
      return ''
    }
  }

  useEffect(() => {
    setChatName(getChatName(chatItem))
    setIsGroupChat(prev => chatItem?.type == "group" ?? prev)
    setStatusText(getStatusText(chatItem))
  }, [chatItem, newChatName])

  useEffect(() => {
    setChatItem(chatsList?.find(item => item._id == id) ?? null)
  }, [id, chatsList])

  useEffect(() => {
  }, [chatItem])

  useEffect(() => {
    setConversation([].concat(groupMessages[id] ?? []))
  }, [groupMessages, id])

  const [messageBoxTextRTL, setMessageBoxTextRTL] = useState(false)
  return (
    <div className='chat-window--area'>
      <div className='chat-window--header'>
        <div className='chat-window--header-info'>
          <img src={CHAT_TYPES[chatItem?.type] ?? CHAT_TYPES.contact} style={{ width: '32px' }} alt={`${chatItem?.type ?? 'contact'} image`} />
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
          <button style={chatItem?.type == 'group' ? {} : { display: 'none' }} onClick={editGroup}>Edit Group</button>
          <button style={chatItem?.type == 'group' ? {} : { display: 'none' }} onClick={leaveGroup}>Leave Group</button>
          <button style={chatItem?.type == 'contact' ? {} : { display: 'none' }} onClick={blockContact}>Block</button>
        </div>
      </div>
      <div className='conversation'>
        {/* TODO: ADD THIS https://stackoverflow.com/questions/72636816/scroll-to-bottom-when-new-message-added */}
        <ul className='messages-list'>
          {
            conversation && conversation?.map(item => {
              const sender = chatItem.members.find(m => m._id == item.sender)?.username ?? ":unknown:"
              return (
                <li key={item.id} className={thisUser == sender ? 'message message-me' : 'message message-others'} style={/^[\u0590-\u05fe]+/.test(item.message) ? { direction: 'rtl' } : {}}>
                  <span style={(!isGroupChat || thisUser == sender) ? { display: 'none' } : {}} className='message-sender--title'>
                    {sender}<br />
                  </span>
                  <span>{item.message}</span>
                </li>
              )
            })
          }
        </ul>
      </div>
      <div className='chat-window--footer'>
        <form action="" onSubmit={handleSubmit} ref={messageFormRef}>
          <input id="messagebox" type="text" onChange={e => setMessageBoxTextRTL(/^[\u0590-\u05fe]+/.test(e.target.value))} style={messageBoxTextRTL ? { direction: 'rtl' } : {}} />
          <button id="sendbutton" type='submit'>{"\u2B9E"}</button>
        </form>
      </div>
    </div>
  )
}

export default Chat