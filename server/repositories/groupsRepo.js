// const sqlite3 = require('sqlite3').verbose();
// const sqlite = require('sqlite')
const {getByQuery, runQuery} = require('../configs/sqldb')
// const fs = require('node:fs');
 
const create = async (name, description, createdDate, members) => {
  const groupRecord = await runQuery('INSERT INTO groups (name, description, createdDate) VALUES (?, ?, ?)', name, description, createdDate)
  members?.forEach(async (userId) => {
    await runQuery('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', groupRecord.lastID, userId)
  })
  return groupRecord
}

const getMembersById = (groupId) => {
  return getByQuery(`SELECT user_id FROM group_members WHERE group_id == ?`, {single: false}, groupId)
}

const joinMember = (groupId, userId) => {
  return runQuery('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', groupId, userId)
}

const getById = (id) => {
  return getByQuery(`SELECT * FROM groups WHERE id == ?`, {single: true}, id)
}

const getByUserId = (userId) => {
  return getByQuery(`
  SELECT DISTINCT id, name, description, createdDate FROM groups
  INNER JOIN group_members
  ON groups.id=group_members.group_id WHERE group_members.user_id = ?`, null, userId)
}

//

const getAll = () => {
  return getByQuery(`SELECT * FROM groups`)
}


module.exports = {getMembersById, create, getAll, getById, getByUserId, joinMember}