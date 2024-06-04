const sqlite3 = require('sqlite3')
const sqlite = require('sqlite')
const fs = require('fs');

const SQLDB_PATH = process.env.SQLDB_PATH || 'chat.db'

const getByQuery = async (query, options = {}, ...argArray) => {
  let db;
  let result;

  try {
    db = await sqlite.open({
      filename: SQLDB_PATH,
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_READONLY
    })
    // console.debug('Connected to the %s database.', SQLDB_PATH);
    // console.debug("query (%s): %s, args: %s", (options?.single?'get':'all'), query, argArray)
    if (options?.single) {
      result = await db.get(query, argArray)
    }
    else {
      result = await db.all(query, argArray)
    }
    //console.debug(result);
    await db.close();
  }
  catch (err) {
    console.error(err.message);
    throw err
  }

  return result;
}

const runQuery = async (query, ...argArray) => {
  let db;
  let result;

  try {
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
  catch (err) {
    console.error(err.message);
    throw err
  }

  return result;
}

const execQuery = async (query, ...argArray) => {
  let db;
  let result;

  try {
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
  catch (err) {
    console.error(err.message);
    throw err
  }

  return result;
}

/**
 * @param {function} operation
 */
const dbShell = async (operation) => {
  let db;
  let result;

  try {
    db = await sqlite.open({
      filename: SQLDB_PATH,
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_READWRITE
    })
    // console.debug('Connected to the %s database.', SQLDB_PATH);
    // console.debug("query: %s, args: %s", query, argArray)
    result = await operation(db)

    //console.debug(result);
    await db.close();
  }
  catch (err) {
    console.error(err.message);
    throw err
  }

  return result;
}

const dropAllTables = async (db) => {
  // Begin a transaction
  await db.exec('BEGIN TRANSACTION');

  // Fetch all table names
  const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name<>'sqlite_sequence'");

  // Drop each table
  for (const table of tables) {
    const dropTableSQL = `DROP TABLE IF EXISTS ${table.name}`;
    await db.run(dropTableSQL);
    console.log(`Table ${table.name} dropped.`);
  }

  // Commit the transaction
  await db.exec('COMMIT');

  console.log('All tables dropped successfully.');
};

const dropAllTablesExec = async () => {
  await createDBFileIfDoesNotExist()
  return dbShell(dropAllTables)
}

const createDBFileIfDoesNotExist = () => {
  // Open the file for writing (and create it if it doesn't exist)
  fs.open(SQLDB_PATH, 'w', (err, file) => {
    if (err) {
      console.error(`Error creating file ${SQLDB_PATH}:`, err);
      return;
    }
    console.log(`Empty ${SQLDB_PATH} file created successfully.`);
    fs.close(file, (err) => {
      if (err) {
        console.error('Error closing file:', err);
        return;
      }
      console.log('File closed successfully.');
    });
  });
}

module.exports = { getByQuery, runQuery, execQuery, dropAllTablesExec }