const sqlite3 = require('sqlite3')
const sqlite = require('sqlite')

const SQLDB_PATH = process.env.SQLDB_PATH || 'chat.db'

// const init = async () => {
//   db = await sqlite.open({
//     filename: SQLDB_PATH,
//     driver: sqlite3.Database
//   });

// //   await db.exec(`
// //   CREATE TABLE IF NOT EXISTS credentials (
// //     id INTEGER PRIMARY KEY AUTOINCREMENT,
// //     username TEXT UNIQUE,
// //     password TEXT,
// //     password_hash TEXT
// //   );
// // `);

// //   await db.exec(`
// //   CREATE TABLE IF NOT EXISTS users (
// //     id INTEGER PRIMARY KEY,
// //     username TEXT UNIQUE,
// //     createdDate DATE,
// //     first_name TEXT,
// //     last_name TEXT,
// //     nickname TEXT,
// //     status TEXT,
// //     bio TEXT,
// //     FOREIGN KEY (id) REFERENCES credentials(id)
// //   );
// // `);
// // console.log('success -4')
// //   /**
// //    * direct chat is also a group - where 2 people are talking and they cannot set the name of the group ()
// //    */
// //   await db.exec(`
// //   CREATE TABLE IF NOT EXISTS groups (
// //     id INTEGER PRIMARY KEY AUTOINCREMENT,
// //     name TEXT NOT NULL,
// //     description TEXT,
// //     createdDate DATE
// //   );
// // `);
// // console.log('success -3')
// //   /**
// //    * direct chat is also a group - where 2 people are talking and they cannot set the name of the group
// //    */
// //   await db.exec(`
// //   CREATE TABLE IF NOT EXISTS group_members (
// //     group_id INTEGER NOT NULL,
// //     user_id INTEGER NOT NULL,
// //     PRIMARY KEY (group_id, user_id),
// //     FOREIGN KEY (group_id) REFERENCES groups(id),
// //     FOREIGN KEY (user_id) REFERENCES users(id)
// //   );
// // `);

// // console.log('success -2') 
//   await 

//   // console.log('success -1')
//   return db;
// }

const getByQuery = async (query, options = {}, ...argArray) => {
  let db;
  let result;
 
  try{
    db = await sqlite.open({
      filename: SQLDB_PATH,
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_READONLY
    })
    // console.debug('Connected to the %s database.', SQLDB_PATH);
    // console.debug("query (%s): %s, args: %s", (options?.single?'get':'all'), query, argArray)
    if(options?.single){
      result = await db.get(query, argArray)
    }
    else{
      result = await db.all(query, argArray)
    }
    //console.debug(result);
    await db.close();
  }
  catch(err){
    console.error(err.message);
    throw err
  }

  return result;
}

const runQuery = async (query, ...argArray) => {
  let db;
  let result;

  try{
    db = await sqlite.open({
      filename: SQLDB_PATH,
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_READWRITE
    })
    // console.debug('Connected to the %s database.', SQLDB_PATH);
    // console.debug("query: %s, args: %s", query, argArray)
    result = await db.run(query, argArray)

    //console.debug(result);
    await db.close();
  }
  catch(err){
    console.error(err.message);
    throw err
  }

  return result;
}

const execQuery = async (query, ...argArray) => {
  let db;
  let result;

  try{ 
    db = await sqlite.open({
      filename: SQLDB_PATH,
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_READWRITE
    })
    // console.debug('Connected to the %s database.', SQLDB_PATH);
    // console.debug("query: %s, args: %s", query, argArray)
    result = await db.exec(query, argArray)

    //console.debug(result);
    await db.close();
  }
  catch(err){
    console.error(err.message);
    throw err
  }

  return result;
}

module.exports = {getByQuery, runQuery, execQuery}