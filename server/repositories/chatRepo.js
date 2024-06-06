const chat = require('../models/chatModel')

const create = (object) => {
  return chat.create(object)
}

const update = (id, object) => {
  return chat.findByIdAndUpdate(id, object, { new: true }).populate('members').exec()
}

const getById = (id) => {
  return chat.findById(id).populate('members').exec()
}

const getByUserId = (userId) => {
  return chat.find({ members: userId }).populate('members').exec()
}


module.exports = { create, getByUserId, update, getById }