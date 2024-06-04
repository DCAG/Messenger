import React from 'react'

function Toast({ payload, show, type }) {
  if (!show) {
    return
  }
  if (type === 'connection') {
    return (
      <div className="toast-container">
        <div className="toast-message">
          {payload} connected!
        </div>
      </div>
    )
  }
  else if (type === 'message') {
    return (
      <div className="toast-container">
        <div className="toast-message">
          {`${payload?.contactName} (${payload?.chatName}) says: `}<br />
          {payload?.message}
        </div>
      </div>
    )
  }
}

export default Toast