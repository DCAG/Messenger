import React from 'react'

function SignUp() {
  return (
    <div className='signup'>
      <form action="" method="post">
        <label htmlFor="username">Username</label>
        <input type="text" name="username" id="username" />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
        <button type="submit"></button>
      </form>
    </div>
  )
}

export default SignUp