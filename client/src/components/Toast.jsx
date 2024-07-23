import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Toast({ show, type, payload, onNavigation }) {
  const navigate = useNavigate()
  const [showToast, setShowToast] = useState(show)
  useEffect(() => {
    setShowToast(show)
  }, [show])

  const getMessageStyle = (content) => {
    if (/^[\u0590-\u05fe]+/.test(content)) {
      return 'rtl'
    }
    return 'ltr'
  }

  const handleClick = () => {
    onNavigation()
    navigate('/chats/' + (payload.chatType ?? 'private') + '/' + payload.chatId)
  }

  if (!showToast) {
    return
  }
  if (type === 'connection') {
    return (
      <div className="toast-container">
        <span className='toast-message span1' dir={getMessageStyle(payload)}>{payload} connected!</span>
        <span className="toast-close" onClick={() => setShowToast(false)}>{"\u00d7"}</span>
      </div>
    )
  }
  else if (type === 'message') {
    return (
      <div className="toast-container" onClick={handleClick}>
        <span className='toast-sender' dir={getMessageStyle(payload?.contactName)}>{`${payload?.contactName} ${payload?.chatName ? '(' + payload?.chatName + ')' : ''} says: `}</span>
        <span className="toast-close" onClick={() => setShowToast(false)}>{"\u00d7"}</span>
        <span className='toast-message' dir={getMessageStyle(payload?.message)}>{payload?.message}</span>
      </div>
    )
  }
}

export default Toast