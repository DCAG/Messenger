const groupsRepo = require('../repositories/groupsRepo')

const create = async (name, description, members) => {
  const result = await groupsRepo.create(name, description, new Date(), members)
  return result;
}

const getMembersById = (groupId) => {
  return groupsRepo.getMembersById(groupId)
}

const joinMember = async (groupId, userId) => {
  return groupsRepo.joinMember(groupId, userId)
}

const getById = (id) => {
  return groupsRepo.getById(id)
}

const getByUserId = (userId) => {
  return groupsRepo.getByUserId(userId)
}

const getAll = () => {
  return groupsRepo.getAll()
}

module.exports = {getMembersById, create, getAll, getById, getByUserId, joinMember}