const user = require('../models/userModel')
const creds = require('../models/credsModel')

const getById = (id) => {
  return user.findById(id).populate('groups').exec()
}

const getByUsername = (username) => {
  return user.findOne({username: username}).populate('groups').exec()
}

const getCredentials = (username) => {
  return creds.findOne({username: username})
}

const getAll = () => {
  return user.find()
}

const create = async (object) => {
  let userCreds = {
    username: object.username,
    password: object.password,
    passwordHash: object.passwordHash
  }
  
  console.log("userCreds",userCreds)
  const credsDoc = await creds.create(userCreds)
  
  delete object.password
  delete object.passwordHash
  let userObject = {...object, _id: credsDoc._id}

  console.log("userObject", userObject)

  return await user.create(userObject)
}

const update = (id, object) => {
  return user.findByIdAndUpdate(id, object, {returnDocument: 'after'})
}

module.exports = {update, create, getAll, getCredentials, getById, getByUsername} //, create, update, remove}