import React from 'react'
import profileImage from '../assets/contact-small.png'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../utils/useAuth'
import useSocket from '../utils/useSocket'

function ProfileMenu({ onNavigation }) {
  const { logoutUser } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()

  const logout = () => {
    logoutUser();
    navigate('/login')
    socket.disconnect();
  }

  return (
    <div className='profile-button'>
      <div className='profile-button__face'>
        <img src={profileImage} alt={`profile image`} />
        <span>
          {sessionStorage['username']}
        </span>
      </div>
      <div className="profile-button__dropdown-content">
        <Link to="profile/blocked" onClick={() => onNavigation()}>Blocked Contacts</Link>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  )
}

export default ProfileMenu