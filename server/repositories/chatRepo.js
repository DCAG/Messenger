// const sqlite3 = require('sqlite3').verbose();
// const sqlite = require('sqlite')
const {getByQuery, runQuery, execQuery} = require('../configs/sqldb')
// const fs = require('node:fs');
 
const constCreateMessagesTable = (tableName) => {
  return execQuery(`
  CREATE TABLE IF NOT EXISTS ? (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    senderId INTEGER NOT NULL, -- user._id
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );`, tableName)
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
  return runQuery('INSERT INTO ? (senderId, content) VALUES (?, ?)',groupId, senderId, content)
}

const getAllMessages = (groupId) => {
  return getByQuery(`SELECT * FROM ?`, groupId)
}

// const getSingleMessageById = (groupId, id) => {
//   return getByQuery(`SELECT * FROM ? WHERE id == ?`, {single: true}, groupId, id)
// }

// const getByUsername = (groupId, username) => {
//   return getByQuery(`SELECT * FROM ? WHERE username == ?`, {single: true}, groupId, username)
// }

module.exports = {constCreateMessagesTable, getAllMessages, writeMessage} //, create, update, remove}