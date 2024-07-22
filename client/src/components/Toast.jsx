import React, { useEffect, useState } from 'react'

function Toast({ show, type, payload }) {
  const [showToast, setShowToast] = useState(show)
  useEffect(() => {
    setShowToast(show)
  }, [show])

  if (!showToast) {
    return
  }
  if (type === 'connection') {
    return (
      <div className="toast-container">
        <span className='toast-message span1'>{payload} connected!</span>
        <span className="toast-close" onClick={() => setShowToast(false)}>{"\u00d7"}</span>
      </div>
    )
  }
  else if (type === 'message') {
    return (
      <div className="toast-container">
        <span className='toast-sender'>{`${payload?.contactName} ${payload?.chatName ? '(' + payload?.chatName + ')' : ''} says: `}</span>
        <span className="toast-close" onClick={() => setShowToast(false)}>{"\u00d7"}</span>
        <span className='toast-message'>{payload?.message}</span>
      </div>
    )
  }
}

export default Toast