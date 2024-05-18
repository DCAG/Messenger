const bcrypt = require('bcrypt')
const usersRepo = require('../repositories/usersRepo')

const verifyCredentials = async (username, password) => {
  const creds = await usersRepo.getCredentials(username)
  if(creds){
    return await bcrypt.compare(password, creds.password_hash) 
  }
  return false
}

const getByUsername = (username) => {
  username.trim()
  return usersRepo.getByUsername(username)
}

module.exports = {verifyCredentials, getByUsername}