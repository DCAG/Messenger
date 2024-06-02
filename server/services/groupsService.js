const groupsRepo = require('../repositories/groupsRepo')
const chatRepo = require('../repositories/chatRepo')

const create = async (object) => {
  const group = await groupsRepo.create(object)
  await chatRepo.createMessagesTable(group._id)
  return group
}

const update = async (id, object) => {
  const group = await groupsRepo.update(id, object)
  return group
}

const joinMember = async (groupId, userId) => {
  const group = await groupsRepo.getById(groupId)
  group.members.push(userId)
  return await groupsRepo.update(groupId, group)
}

const getById = (id) => {
  return groupsRepo.getById(id)
}

const getByUserId = (userId) => {
  return groupsRepo.getByUserId(userId)
}

module.exports = {getByUserId, create, update, getById, joinMember}