import React from 'react'
import contactLogo from '../assets/contact-small.png'
import { Link } from 'react-router-dom'

function Profile() {
  return (
    <div className='chat-list--profile profile-dropdown'>
      <div className='profile-dropbtn'>
        <img src={contactLogo} style={{width:'32px'}} alt={`contact image`} />
        <span>
          {sessionStorage['username']}
        </span>
      </div>
      <div class="profile-dropdown-content">
        <Link to="/blockedContacts">Blocked Contacts</Link>
        <Link to="/Logout">Logout</Link>
      </div>
    </div>
  )
}

export default Profile