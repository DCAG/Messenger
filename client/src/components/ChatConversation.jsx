import { useEffect, useState } from 'react'
import useSocket from '../utils/useSocket'

/**
 * 
 * @param {Chat} chat
 * @returns 
 */
function ChatConversation({ chat }) {
  const { messageGroups, contacts } = useSocket()
  const [conversation, setConversation] = useState([].concat(messageGroups[chat?._id] ?? []))
  const [chatMembers, setChatMembers] = useState({})
  const userId = sessionStorage['id']

  useEffect(() => {
    if (chat) {
      let members = {}
      for (const member of chat?.members) {
        members[member._id] = member
      }
      setChatMembers(members)
    }
  }, [chat])

  useEffect(() => {
    setConversation([].concat(messageGroups[chat?._id] ?? []))
  }, [messageGroups, chat])

  const getMessageStyle = (content) => {
    if (/^[\u0590-\u05fe]+/.test(content)) {
      return { direction: 'rtl' }
    }
    return {}
  }

  const getSender = (senderId) => {
    let senderResult = {}
    if(chatMembers[senderId]){
      senderResult._id = chatMembers[senderId]._id
      senderResult.displayName = chatMembers[senderId].username
    }else if(contacts[senderId]){
      senderResult._id = contacts[senderId]._id
      senderResult.displayName = contacts[senderId].username + ' (Past Member)'
    }else{
      senderResult._id = undefined
      senderResult.displayName = ':unknown:'
    }
    return senderResult
  }

  return (
    <div className='conversation'>
      {/* TODO: ADD THIS https://stackoverflow.com/questions/72636816/scroll-to-bottom-when-new-message-added */}
      <ul className='messages-list'>
        {
          conversation && conversation.map(msg => {
            const sender = getSender(msg.senderId)
            return (
              <li key={msg.id} className={userId === sender?._id ? 'message message-me' : 'message message-others'} style={getMessageStyle(msg.content)}>
                <span style={(chat.type !== 'group' || userId === sender?._id) ? { display: 'none' } : {}} className='message-sender--title'>
                  {sender.displayName}<br />
                </span>
                <span>{msg.content}</span><br />
                <span className='message--timestamp'>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}

export default ChatConversation