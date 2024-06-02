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

/**
 * 
 * @param {String} groupId 
 * @returns 
 */
const getAllMessages = (groupId) => {
  return getByQuery(`SELECT * FROM ${'c'+groupId}`)
}

/**
 * 
 * @param {String} groupId 
 * @param {Number} offset 
 * @returns 
 */
const getAllRemainingMessages = (groupId, offset) => {
  return getByQuery(`SELECT * FROM ${'c'+groupId} WHERE id > ?`,{}, offset)
}

module.exports = {getAllRemainingMessages, createMessagesTable, getAllMessages, writeMessage} //, create, update, remove}