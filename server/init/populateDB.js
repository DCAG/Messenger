const fs = require('fs')
const fsPromises = require('fs').promises
const csvParse = require('csv-parse')
const bcrypt = require('bcrypt')

const USERS_DATA = "./init/usersData.csv"
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 10

const usersService = require('../services/usersService')
const credsModel = require('../models/credsModel')
const usersModel = require('../models/userModel')
const chatModel = require('../models/chatModel')
const { dropAllTablesExec } = require('../configs/sqldb')
// const connectMongoDB = require('../configs/mongodb')

// connectMongoDB() // NOTE: will keep the process running!!!

const dropAllCollections = () => {
  return Promise.all([
    credsModel.collection.drop(),
    chatModel.collection.drop(),
    usersModel.collection.drop(),
  ])
}

const parseCSV = (fileData) => {
  return new Promise((resolve, reject) => {
    csvParse.parse(fileData, { delimiter: '|', trim: true, columns: true }, (err, records) => {
      if (err) {
        return reject(err);
      }
      resolve(records);
    });
  });
};

const loadUsersData = async () => {
  try {
    const fileData = await fsPromises.readFile(USERS_DATA, 'utf8');
    console.log("reading", fileData);

    const parsedFile = await parseCSV(fileData);

    const usersObjects = await Promise.all(parsedFile.map(async (record) => {
      delete record.id;
      delete record.passwordHash;
      delete record.createdDate;
      const user = { ...record };

      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      user.passwordHash = await bcrypt.hash(user.password, salt);
      return user;
    }));

    console.log(usersObjects.length);

    for (const user of usersObjects) {
      await usersService.create(user);
    }

    return true;
  } catch (error) {
    console.error('Error loading user data:', error);
    return false;
  }
};

const createFlag = (flagName) => {
  const path = `./${flagName}-loaded.flag.txt`

  fs.open(path, 'w', (err, file) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Flag for [${flagName}] created successfully!`);
    }
  });
}

const flagExists = (flagName) => {
  const path = `./${flagName}-loaded.flag.txt`

  try {
    if (fs.existsSync(path)) {
      console.log(`Flag for [${flagName}] exists (${path})`);
      return true
    } else {
      console.log(`Flag for [${flagName}] does not exists (${path})`);
    }
  } catch (err) {
    console.error(err);
  }
  return false
}

const loadExternalData = async () => {
  if (!flagExists('users')) {
    if (process.env.DROP_ALL_COLLECTIONS == 1) {
      await dropAllCollections()
    }
    if (process.env.DROP_ALL_MESSAGES == 1) {
      await dropAllTablesExec()
    }
    console.log('loading [users] data from csv file into mongodb')
    if (await loadUsersData()) {
      createFlag('users')
    }
  }
}

module.exports = loadExternalData