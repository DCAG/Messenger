const fs = require('fs')
const csvParse = require('csv-parse')
const bcrypt = require('bcrypt')

const USERS_DATA = "./init/usersData.csv"
const SALT_ROUNDS = process.env.SALT_ROUNDS || 10

const usersService = require('../services/usersService')
const connectMongoDB = require('../configs/mongodb')

connectMongoDB() // NOTE: will keep the process running!!!

fs.readFile(USERS_DATA, 'utf-8', async function (err, fileData) {

  console.log("reading", fileData)
  const parsedFile = csvParse.parse(fileData, { delimiter: '|', trim: true, columns: true })
  //console.log(parsedFile)

  usersObjects = parsedFile.map(async (record) => {
    delete record.id
    delete record.passwordHash
    delete record.createdDate
    user = { ...record }

    user.passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS)
    return user
  })

  console.log(usersObjects.length)
   
  usersObjects.forEach(async (user) => {
    usersService.create(user)
  })
})
