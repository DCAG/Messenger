const chatRepo = require('../repositories/chatRepo')

const create = async (object) => {
  const chat = await chatRepo.create(object)
  return chat
}

const update = async (id, object) => {
  const chat = await chatRepo.update(id, object)
  return chat
}

const joinMember = async (chatId, userId) => {
  const chat = await chatRepo.getById(chatId)
  chat.members.push(userId)
  return await chatRepo.update(chatId, chat)
}

const getById = (id) => {
  return chatRepo.getById(id)
}

const getByUserId = (userId) => {
  return chatRepo.getByUserId(userId)
}

module.exports = {getByUserId, create, update, getById, joinMember}