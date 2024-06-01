const bcrypt = require('bcrypt')
const usersRepo = require('../repositories/usersRepo')

const verifyCredentials = async (username, password) => {
  const creds = await usersRepo.getCredentials(username)
  if(creds){
    return await bcrypt.compare(password, creds.passwordHash) 
  }
  return false
}

const getById = (id) => {
  return usersRepo.getById(id)
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

const update = (id,object) => {
  return usersRepo.update(id,object)
}

module.exports = {getById, update, verifyCredentials, create, getByUsername, getAll}