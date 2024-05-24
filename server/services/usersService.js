const bcrypt = require('bcrypt')
const usersRepo = require('../repositories/usersRepo')

const verifyCredentials = async (username, password) => {
  const creds = await usersRepo.getCredentials(username)
  if(creds){
    return await bcrypt.compare(password, creds.passwordHash) 
  }
  return false
}

const getByUsername = (username) => {
  return usersRepo.getByUsername(username)
}

const getAll = () => {
  return usersRepo.getAll()
}

const create = (object) => {
  return usersRepo.create(object)
}

module.exports = {verifyCredentials, create, getByUsername, getAll}