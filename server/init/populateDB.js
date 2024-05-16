const dbInstance = require('../configs/db')
const fs = require('fs')
const csvParse = require('csv-parse')
const bcrypt = require('bcrypt')

const USERS_DATA = "./init/usersData.csv"
const SALT_ROUNDS = process.env.SALT_ROUNDS || 10



fs.readFile(USERS_DATA, 'utf-8', async function (err, fileData) {
  const db = await dbInstance.init()
  console.log("reading",fileData)
  const parsedFile = csvParse.parse(fileData, {delimiter: '|', trim: true, columns: true})
  console.log(parsedFile)

  usersObjects = parsedFile.map(async (record) => {
    delete record.id
    delete record.password_hash
    user = {...record}

    user.password_hash = await bcrypt.hash(user.password, SALT_ROUNDS)
    return user
  })
  console.log(usersObjects.length)
  usersObjects.forEach(async (user) => {
    await db.run('INSERT INTO users (username, password, password_hash, createdDate, first_name, last_name, nickname, status, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      user.username,
      user.password,
      user.password_hash,
      user.createdDate,
      user.first_name,
      user.last_name,
      user.nickname,
      user.status,
      user.bio
    );
  })
})
