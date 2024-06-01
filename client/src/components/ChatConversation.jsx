import { useEffect, useState } from 'react'
import useSocket from '../utils/useSocket'

/**
 * 
 * @param {*} id 
 * @param {ChatType} type 
 * @returns 
 */
function ChatConversation({id, type}) {
  const { messageGroups, contacts } = useSocket()
  const [conversation, setConversation] = useState([].concat(messageGroups[id] ?? []))

  const userId = sessionStorage['id']

  useEffect(() => {
    setConversation([].concat(messageGroups[id] ?? []))
  }, [messageGroups, id])

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
            const sender = contacts[msg.sender]
            return (
              <li key={msg.id} className={userId === sender?._id ? 'message message-me' : 'message message-others'} style={getMessageStyle(msg.message)}>
                <span style={(type!=='group' || userId === sender?._id) ? { display: 'none' } : {}} className='message-sender--title'>
                  {sender.username}<br />
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