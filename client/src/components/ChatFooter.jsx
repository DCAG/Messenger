import { useRef, useState } from 'react'
import useSocket from '../utils/useSocket'

function ChatFooter({ id, contactId }) {
  const { socket } = useSocket()
  const messageFormRef = useRef()
  const [msgBoxTextRTL, setMsgBoxTextRTL] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const content = e.target[0].value
    const isNewPrivateChat = !id && contactId
    if (!content || content.trim().length === 0) {
      // prevent sending an empty string
      return
    }
    if (isNewPrivateChat) {
      const newMessage = { contactId, content }
      socket.emit('chat:private:new:message', newMessage)
    }
    else {
      const newMessage = { chatId: id, content }
      socket.emit('chat:message', newMessage)
    }
    // Reset messagebox
    messageFormRef.current.reset()
  }

  const handleChange = (e) => {
    setMsgBoxTextRTL(/^[\u0590-\u05fe]+/.test(e.target.value))
  }

  return (
    <div className='chat-window__footer'>
      <form action="" onSubmit={handleSubmit} ref={messageFormRef}>
        <input id="messagebox" type="text" onChange={handleChange} style={msgBoxTextRTL ? { direction: 'rtl' } : {}} />
        <button id="sendbutton" type='submit'>{"\u2192"}</button>
      </form>
    </div>
  )
}

export default ChatFooter