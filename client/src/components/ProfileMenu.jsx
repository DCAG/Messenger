import React from 'react'
import profileImage from '../assets/contact-small.png'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../utils/useAuth'
import useSocket from '../utils/useSocket'

function ProfileMenu() {
  const { logoutUser } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()

  const logout = () => {
    logoutUser();
    navigate('/login')
    socket.disconnect();
  }

  return (
    <div className='chat-list--profile profile-dropdown'>
      <div className='profile-dropbtn'>
        <img src={profileImage} className='profile-dropbtn--image' alt={`profile image`} />
        <span>
          {sessionStorage['username']}
        </span>
      </div>
      <div className="profile-dropdown-content">
        <Link to="profile/blocked">Blocked Contacts</Link>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  )
}

export default ProfileMenu