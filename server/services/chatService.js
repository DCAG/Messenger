const chatRepo = require('../repositories/chatRepo')

/**
 * 
 * @param {String} groupId 
 * @param {String} senderId 
 * @param {String} content 
 * @returns 
 */
const writeMessage = (groupId, senderId, content) => {
  return chatRepo.writeMessage(groupId, senderId, content)
}

/**
 * 
 * @param {String} groupId 
 * @returns 
 */
const getAllMessages = async (groupId) => {
  try {
    return await chatRepo.getAllMessages(groupId)
  }
  catch (e) {
    if (/no such table/.test(e.message)) {
      return undefined
    }
    else {
      throw e
    }
  }
}

/**
 * 
 * @param {String} groupId 
 * @param {Number} offset 
 * @returns 
 */
const getAllRemainingMessages = (groupId, offset) => {
  try {
    return chatRepo.getAllRemainingMessages(groupId, offset)
  }
  catch (e) {
    if (/no such table/.test(e.message)) {
      return undefined
    }
    else {
      throw e
    }
  }
}

module.exports = { getAllRemainingMessages, writeMessage, getAllMessages }