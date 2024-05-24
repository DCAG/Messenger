const group = require('../models/groupModel')
 
const create = (object) => {
  return group.create(object)
}

const update = (id, object) => {
  return group.findByIdAndUpdate(id,object)
}

const getById = (id) => {
  return group.findById(id).populate('members').exec()
}

const getByUserId = (userId) => {
  return group.find({members: userId}).populate('members').exec()
}


module.exports = {create, getByUserId, update, getById}