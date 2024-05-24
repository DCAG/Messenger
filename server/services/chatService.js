const chatRepo = require('../repositories/chatRepo')

const writeMessage = (groupId, senderId, content) => {
  return chatRepo.writeMessage(groupId, senderId, content)
}

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