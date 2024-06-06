import React from 'react'

function TestItYourself({onClick}) {
  const users = [
    {
      "username": "alice",
      "password": "p@ssw0rd"
    },
    {
      "username": "bob",
      "password": "secret123"
    },
    {
      "username": "charlie",
      "password": "qwerty"
    },
    {
      "username": "david",
      "password": "letmein"
    },
    {
      "username": "emily",
      "password": "123456"
    },
    {
      "username": "frank",
      "password": "password"
    },
    {
      "username": "grace",
      "password": "sunshine"
    },
    {
      "username": "harry",
      "password": "football"
    },
    {
      "username": "isabella",
      "password": "iloveyou"
    },
    {
      "username": "jack",
      "password": "baseball"
    }]
  return (
    <div>
    <center>
      Test this yourself: <br />
      <table>
        <thead>
          <tr>
            <td style={{ paddingRight: '15px' }}><b>username</b></td>
            <td><b>password</b></td>
          </tr>
        </thead>
        <tbody>
          {
            users.map(user => {
                return (
                  <tr key={user.username}>
                    <td>{user.username}</td>
                    <td>{user.password}</td>
                    <td><button onClick={() => onClick(user)}>use</button></td>
                  </tr>
                )
              })
          }
        </tbody>
      </table>
    </center>
  </div>
  )
}

export default TestItYourself