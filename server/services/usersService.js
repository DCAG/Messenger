const bcrypt = require('bcrypt')

const verifyCredentials = (username, password) => {

}

const create = async () => {
  {
    username
    password
    createdDate
  }

  const saltRounds = process.env.SALT_ROUNDS || 10

  await bcrypt.hash(password, saltRounds)
  .then(hash => {
    console.log('Hash ', hash)
  })
  .catch(err => console.error(err.message))
}

module.exports = {}