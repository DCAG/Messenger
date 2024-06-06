const {dbShell, SQLITE_MODES} = require('../configs/sqldb')
 
// /**
//  * 
//  * @param {String} chatId
//  * @returns 
//  */
// const createMessagesTable = (chatId) => {
//   // table names cannot be accepted as arguments
//   // NOTE: make sure the group name is coming from previous mongodb query result
//   return execQuery(`
//   CREATE TABLE IF NOT EXISTS c${chatId} (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     senderId INTEGER NOT NULL,
//     content TEXT NOT NULL,
//     timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
//   );`)
// }

/**
 * 
 * @param {String} chatId 
 * @param {String} userId 
 * @param {String} content 
 * @returns 
 */
const writeMessage = (chatId, userId, content) => {
  return dbShell(SQLITE_MODES.OPEN_READWRITE, async db => {
    await db.exec(`
    CREATE TABLE IF NOT EXISTS c${chatId} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      senderId INTEGER NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    `)
    return await db.run(`
    INSERT INTO ${'c'+chatId} (senderId, content) VALUES (?, ?);
    `,userId, content)
  })
}

/**
 * 
 * @param {String} chatId 
 * @returns 
 */
const getAllMessages = (chatId) => {
  return dbShell(SQLITE_MODES.OPEN_READONLY, db => 
    db.all(`SELECT * FROM ${'c'+chatId}`)
  )
}

/**
 * 
 * @param {String} chatId 
 * @param {Number} offset 
 * @returns 
 */
const getAllRemainingMessages = (chatId, offset) => {
  return dbShell(SQLITE_MODES.OPEN_READONLY, db => 
    db.all(`SELECT * FROM ${'c'+chatId} WHERE id > ?`, offset)
  )
} 

module.exports = {getAllRemainingMessages, getAllMessages, writeMessage} //createMessagesTable,