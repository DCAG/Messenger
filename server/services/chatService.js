const chatRepo = require('../repositories/chatRepo')

const create = async (groupId, senderUserId, content) => {
  const result = await chatRepo.create(groupId, senderUserId, content)
  return result;
}

const getById = (id) => {
  return chatRepo.getById(id)
}

const getByUsername = (username) => {
  return chatRepo.getByUsername(username)
}

const getAll = () => {
  return chatRepo.getAll()
}


module.exports = {create, getById, getByUsername, getAll}