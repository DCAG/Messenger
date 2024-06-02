import { useEffect, useState } from 'react'
import useSocket from '../utils/useSocket'

/**
 * 
 * @param {Chat} chat
 * @returns 
 */
function ChatConversation({chat}) {
  const { messageGroups } = useSocket()
  const [conversation, setConversation] = useState([].concat(messageGroups[chat?._id] ?? []))
  const [chatMembers, setChatMembers] = useState({})
  const userId = sessionStorage['id']

  useEffect(() => {
    setChatMembers(prev => {      
      chat?.members.forEach(m => {
        prev[m._id] = m
      })
      return prev
    })
  },[chat])

  useEffect(() => {
    setConversation([].concat(messageGroups[chat?._id] ?? []))
  }, [messageGroups, chat])

  const getMessageStyle = (content) => {
    if(/^[\u0590-\u05fe]+/.test(content)){
      return { direction: 'rtl' }
    }
    return {}
  }

  return (
    <div className='conversation'>
      {/* TODO: ADD THIS https://stackoverflow.com/questions/72636816/scroll-to-bottom-when-new-message-added */}
      <ul className='messages-list'>
        {
          conversation && conversation.map(msg => {
            const sender = chatMembers[msg.sender]
            return (
              <li key={msg.id} className={userId === sender?._id ? 'message message-me' : 'message message-others'} style={getMessageStyle(msg.message)}>
                <span style={(chat.type!=='group' || userId === sender?._id) ? { display: 'none' } : {}} className='message-sender--title'>
                  {sender?.username}<br />
                </span>
                <span>{msg.message}</span>
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}

export default ChatConversation