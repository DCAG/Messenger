/**
 * @typedef {Object} Contact
 * @property {String} _id
 * @property {String} username
 * @property {Chat[]} chats
 * @property {Contact[]} blockedList
 */

/**
 * @typedef {'private' | 'group' | 'self'} ChatType
 */

/**
 * @typedef {Object} Chat
 * @property {String} _id
 * @property {ChatType} type
 * @property {String} name
 * @property {Contact[]} members
 */

/**
 * @typedef {Object} Message
 * @property {String} _id
 * @property {String} senderId
 * @property {String} content
 * @property {Date} timestamp
 */

/**
 * @typedef {Object} MessagesBulk
 * @property {String} chatId
 * @property {Message[]} messages
 */