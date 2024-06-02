/**
 * @typedef {Object} NewMessage
 * @property {String} chatId
 * @property {String} content
 */

/**
 * @typedef {Object} NewPrivateChatAndMessage
 * @property {String} ContactId
 * @property {String} content
 */

/**
 * @typedef {Object} Message
 * @property {String} _id
 * @property {String} senderId
 * @property {String} content
 * @property {Date} timestamp
 */

/**
 * @typedef {Object} Chat
 * @property {String} _id
 * @property {ChatType} type
 * @property {String} name
 * @property {Contact[]} members
 */

/**
 * @typedef {Object} MessagesBulk
 * @property {String} chatId
 * @property {Message[]} messages
 */