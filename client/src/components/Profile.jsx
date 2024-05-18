import React from 'react'
import contactLogo from '../assets/contact-small.png'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../utils/useAuth'

function Profile() {
  const { logoutUser } = useAuth()
  const navigate = useNavigate()

  const logout = () => {
    logoutUser();
    navigate('/login')
  }

  return (
    <div className='chat-list--profile profile-dropdown'>
      <div className='profile-dropbtn'>
        <img src={contactLogo} style={{width:'32px'}} alt={`contact image`} />
        <span>
          {sessionStorage['username']}
        </span>
      </div>
      <div className="profile-dropdown-content">
        <Link to="/blockedContacts">Blocked Contacts</Link>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  )
}

export default Profile