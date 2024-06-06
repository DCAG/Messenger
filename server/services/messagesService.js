const messagesRepo = require('../repositories/messagesRepo')

/**
 * 
 * @param {String} chatId 
 * @param {String} senderId 
 * @param {String} content 
 * @returns 
 */
const writeMessage = (chatId, senderId, content) => {
  return messagesRepo.writeMessage(chatId, senderId, content)
}

/**
 * 
 * @param {String} chatId 
 * @returns 
 */
const getAllMessages = async (chatId) => {
  try {
    return await messagesRepo.getAllMessages(chatId)
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
 * @param {String} chatId 
 * @param {Number} offset 
 * @returns 
 */
const getAllRemainingMessages = async(chatId, offset) => {
  try {
    return await messagesRepo.getAllRemainingMessages(chatId, offset)
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