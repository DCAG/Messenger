// const sqlite3 = require('sqlite3').verbose();
// const sqlite = require('sqlite')
const {getByQuery, runQuery, execQuery} = require('../configs/sqldb')
// const fs = require('node:fs');
 
const createMessagesTable = (tableName) => {
  // table names cannot be accepted as arguments
  // NOTE: make sure the group name is coming from previous mongodb query result
  return execQuery(`
  CREATE TABLE IF NOT EXISTS c${tableName} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    senderId INTEGER NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );`)
  /*
  FOREIGN KEY (sender_user_id) REFERENCES users(id),
  FOREIGN KEY (group_id) REFERENCES groups(id)
  */
}

/**
 * 
 * @param {*} groupId 
 * @param {*} senderId is userId 
 * @param {*} content 
 * @returns 
 */
const writeMessage = (groupId, senderId, content) => {
  return runQuery(`INSERT INTO ${'c'+groupId} (senderId, content) VALUES (?, ?)`, senderId, content)
}

const getAllMessages = (groupId) => {
  return getByQuery(`SELECT * FROM ${'c'+groupId}`)
}

const getAllRemainingMessages = (groupId, offset) => {
  return getByQuery(`SELECT * FROM ${'c'+groupId} WHERE id > ?`,{}, offset)
}

// const getSingleMessageById = (groupId, id) => {
//   return getByQuery(`SELECT * FROM ? WHERE id == ?`, {single: true}, groupId, id)
// }

// const getByUsername = (groupId, username) => {
//   return getByQuery(`SELECT * FROM ? WHERE username == ?`, {single: true}, groupId, username)
// }

module.exports = {getAllRemainingMessages, createMessagesTable, getAllMessages, writeMessage} //, create, update, remove}