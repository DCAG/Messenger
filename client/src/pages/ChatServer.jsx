import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import groupLogo from '../assets/group-small.png'
import contactLogo from '../assets/contact-small.png'
import useSocket from '../utils/useSocket'

const CHAT_TYPES = {
  'contact': contactLogo,
  'group': groupLogo,
}

function ChatServer() {
  const navigate = useNavigate()
  const someone = {id:'5', type:'contact', name: 'Julia', isTyping: true}
  const isGroupChat = false
  const thisUser = sessionStorage['id']
  const [conversation, setConversation] = useState([])
  // const conversation = []

  const {socket} = useSocket() 

  const handleIncomingMessage = (e) => {
    setConversation(prev => [...prev, e])
  }

  useEffect(() => {
    // as soon as the component is mounted, do the following tasks:

    // emit USER_ONLINE event
    // socket.emit("USER_ONLINE", userId); 

    // subscribe to socket events
    // socket.on("JOIN_REQUEST_ACCEPTED", handleInviteAccepted);
    socket.on("MESSAGE_RECEIVED", handleIncomingMessage); 

    return () => {
      // before the component is destroyed
      // unbind all event handlers used in this component
      socket.off("MESSAGE_RECEIVED", handleIncomingMessage);
    };
  }, [socket]);

  // const editGroup = () => {
  //   navigate(`/${id}/editgroup`)
  // }

  // const leaveGroup = () => {
    
  // }

  // const blockContact = () => {

  // }

  // const { id } = useParams()
  // const chatItem = chatsList.find(item => item.id == id) ?? null
  const messageFormRef = useRef()
  const handleSubmit = (e) => {
    e.preventDefault()
    // Send the message...
    // Reset messagebox
    messageFormRef.current.reset()
  }
  const [messageBoxTextRTL, setMessageBoxTextRTL] = useState(false)
  return (
    <div className='chat-window--area'>
      <div className='chat-window--header'>
        <div className='chat-window--header-info'>
          <img src={CHAT_TYPES.contact} style={{ width: '32px' }} alt={`contact image`} />
          <span>
            {'SERVER'}
          </span>
          <div>
            <span id="chatStatusText">
              {
                someone.isTyping?
                `${someone?.name} is typing...`:(isGroupChat?"Members: " + groupMembers.slice(0,5).join(', ') + "...":'')
              }
            </span>
          </div>
        </div>
        <div className="chat-window--header-actions">
          {/* <button style={chatItem?.type == 'group' ? {} : { display: 'none' }} onClick={editGroup}>Edit Group</button>
          <button style={chatItem?.type == 'group' ? {} : { display: 'none' }} onClick={leaveGroup}>Leave Group</button>
          <button style={chatItem?.type == 'contact' ? {} : { display: 'none' }} onClick={blockContact}>Block</button> */}
        </div>
      </div>
      <div className='conversation'>
        <ul className='messages-list'>
          {
            conversation?.map(item => {
              return (
                <li key={item.id} className={thisUser == item.sender ? 'message message-me' : 'message message-others'} style={/^[\u0590-\u05fe]+/.test(item.message) ? { direction: 'rtl' } : {}}>
                  <span style={(!isGroupChat || thisUser == item.sender) ? { display: 'none' } : {}} className='message-sender--title'>{item.sender} <br /></span>
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

export default ChatServer