const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite')

const fs = require('node:fs');

const DB_PATH = process.env.DB_PATH || 'chat.db'
 
const getByQuery = async (query, options, ...argArray) => {
  let db;
  let result;

  try{
    const currentDirectory = process.cwd();
    console.log(`Current directory: ${currentDirectory}`);

    await fs.exists(DB_PATH, (e) => {
      console.log(e ? 'it exists' : 'no passwd!');
    });
    db = await sqlite.open({
      filename: DB_PATH,
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_READONLY
    })
    console.log('Connected to the %s database.', DB_PATH);
    console.debug("query: %s, args: %s", query, argArray)
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

const getById = (id) => {
  return getByQuery(`SELECT * FROM users WHERE id == ?`, {single: true}, id)
}

const getByUsername = (username) => {
  return getByQuery(`SELECT * FROM users WHERE username == ?`, {single: true}, username)
}

const getCredentials = (username) => {
  return getByQuery(`SELECT password, password_hash FROM credentials WHERE username == ?`, {single: true}, username)
}

const getAll = () => {
  return getByQuery(`SELECT * FROM users`)
}


module.exports = {getByQuery, getAll, getCredentials, getById, getByUsername} //, create, update, remove}