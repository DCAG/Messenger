import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useSocket from '../utils/useSocket'
import ChatHeader from '../components/ChatHeader'
import ChatConversation from '../components/ChatConversation'
import ChatFooter from '../components/ChatFooter'

/**
 * Chat page - used to chat, and create new private chats (once other participant was selected)
 * @returns 
 */
function Chat() {
  const { id, contactId } = useParams()
  const { chats, contacts, privateChatsMap } = useSocket()
  const emptyChatObject = { id: '', name: '', type: '', members: [], privateChatName: '', privateChatContactId: '' }
  const [chat, setChat] = useState(emptyChatObject)
  const navigate = useNavigate()

  // useEffect(() => {
  //   if(contactId && privateChatsMap[contactId]){
  //     // private chat exist - redirect to the existing chat
  //     navigate('private/' + privateChatsMap[contactId])
  //   }
  // },[contactId,privateChatsMap])

  useEffect(() => {
    if (contactId && privateChatsMap[contactId]) {
      // started a new private chat private chat with the same contact already exist - redirect to it.
      navigate('/chats/private/' + privateChatsMap[contactId])
    }

    setChat(prev => {
      if (id) {
        // chat exists
        return chats[id]
      }
      else if (contactId && !privateChatsMap[contactId]) {
        // started new private chat with a contact
        // and the chat is new (doesn't exist yet)
        // private chat does not exist yet
        const contact = contacts[contactId]
        return {
          id: '',
          name: '',
          type: 'private',
          members: [
            contactId,
            sessionStorage['id']
          ],
          privateChatName: contact?.username ?? ':unknown:',
          privateChatContactId: contactId
        }
      }
      else {
        return prev
      }
    })
  }, [id, chats, contactId, privateChatsMap, contacts])

  return (
    <div className='chat-window--area'>
      <ChatHeader chat={chat} />
      <ChatConversation id={chat?._id} type={chat?.type} />
      <ChatFooter id={chat?._id} contactId={contactId} />
    </div>
  )
}

export default Chat