import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../utils/useAuth'
import axios from 'axios'

const LOGIN_URL = 'http://localhost:3000/auth/login'

function Login() {
  const navigate = useNavigate()
  const { loginUser } = useAuth()

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
      navigate('/')
    } catch (error) {
      console.error(error)
      // setFormError(error.response?.data?.message??error)
    }
  }

  return (
    <div>
      <form onSubmit={handleLogin} className='login-form'>
        <input type="text" name="username" value={username} onChange={e => setUsername(e.target.value)} placeholder='Username:' required /> <br />
        <input type="password" name="password" value={password} onChange={e => setPassword(e.target.value)} placeholder='Password:' required /> <br />
        <input type='submit' value="Login" /> <br />
      </form>
    </div>
  )
}

export default Login