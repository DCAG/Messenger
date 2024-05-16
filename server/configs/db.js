const sqlite3 = require('sqlite3')
const sqlite = require('sqlite')

const init = async () => {
  db = await sqlite.open({
    filename: 'chat.db',
    driver: sqlite3.Database
  });

  await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    password_hash TEXT,
    createdDate DATE,
    first_name TEXT,
    last_name TEXT,
    nickname TEXT,
    status TEXT,
    bio TEXT
  );
`);

  /**
   * direct chat is also a group - where 2 people are talking and they cannot set the name of the group ()
   */
  await db.exec(`
  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    createdDate DATE
  );
`);

  /**
   * direct chat is also a group - where 2 people are talking and they cannot set the name of the group
   */
  await db.exec(`
  CREATE TABLE IF NOT EXISTS group_members (
    group_id INTEGER,
    user_id INTEGER
  );
`);

  await db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER,
    sender_user_id INTEGER,
    content TEXT
  );
`);

  return db;
}

module.exports = {init}