import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../utils/useAuth'
import axios from 'axios'
import useSocket from '../utils/useSocket'
import TestItYourself from '../components/TestItYourself'

const LOGIN_URL = `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/auth/login`

function Login() {
  const navigate = useNavigate()
  const { loginUser } = useAuth()
  const { socket } = useSocket()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    const loginData = {
      username: username,
      password: password
    }

    try {
      const { data } = await axios.post(LOGIN_URL, loginData)
      loginUser(data.accessToken, data.user)
      socket.auth = { token: data.accessToken }
      socket.disconnect().connect();
      navigate('/chats')
    } catch (error) {
      console.error(error)
      setErrorMessage(error.response?.data?.message ?? error)
    }
  }

  return (
    <div className='login-page'>
      <h1>Login</h1>
      <form onSubmit={handleLogin} className='login-form'>
        <div className='login-form__fields'>
          <label htmlFor="username">Username: </label>
          <input type="text" name="username" value={username} onChange={e => setUsername(e.target.value)} placeholder='Username:' required />
          <label htmlFor="password">Password: </label>
          <input type="password" name="password" value={password} onChange={e => setPassword(e.target.value)} placeholder='Password:' required />
        </div>
        <div className='login-form__actions'>
          <button type='submit'>Login</button><br />
          <div className='login-form__error'>
            <span>{errorMessage}</span>
          </div>
        </div>
      </form>
      <TestItYourself onClick={user => { setUsername(user.username); setPassword(user.password) }} />
    </div>
  )
}

export default Login