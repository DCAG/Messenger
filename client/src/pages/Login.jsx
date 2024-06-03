import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../utils/useAuth'
import axios from 'axios'
import useSocket from '../utils/useSocket'

const LOGIN_URL = `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/auth/login`

function Login() {
  const navigate = useNavigate()
  const { loginUser } = useAuth()
  const {socket} = useSocket()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    const loginData = {
      username: username,
      password: password
    }

    try {
      const { data } = await axios.post(LOGIN_URL, loginData)
      loginUser(data.accessToken, data.user)
      socket.auth = {token: data.accessToken}
      socket.disconnect().connect();
      navigate('/chats')
    } catch (error) {
      console.error(error)
      // setFormError(error.response?.data?.message??error)
    }
  }

  return (
    <div className='login-page'>
      <h1>Login</h1>
      <form onSubmit={handleLogin} className='login-form'>
        <div className='login-form--fields'>
          <label htmlFor="username">Username: </label>
          <input type="text" name="username" value={username} onChange={e => setUsername(e.target.value)} placeholder='Username:' required />
          <label htmlFor="password">Password: </label>
          <input type="password" name="password" value={password} onChange={e => setPassword(e.target.value)} placeholder='Password:' required />
        </div>
        <div className='login-form--actions'>
          <button type='submit'>Login</button>
          <span></span>
        </div>
      </form>
    </div>
  )
}

export default Login