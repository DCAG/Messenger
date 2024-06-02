const express = require('express')
const jwt = require('jsonwebtoken')
const usersService = require('../services/usersService')
const errorMessages = require('../utils/errorMessages')

const router = express.Router()

// inside: /auth/
router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (typeof username != "string" || typeof password != "string") {
    response.send("Invalid parameters!");
    response.end();
    return;
  }

  if (await usersService.verifyCredentials(username, password)) {
    const user = (await usersService.getByUsername(username))
    delete user.groups // NOTE: must not rely on this - so removing it from jwt token.
    const JWT_SECRET = process.env.JWT_SECRET
    const token = jwt.sign( 
      // TODO: remove iat, maybe spread (...) user inside the token payload or change the name to 'identity' or something...
      { user },
      JWT_SECRET
      // ,
      // { expiresIn: `7d` }
    );
    res.send({ accessToken: token, user: user })
  }
  else {
    res.status(403).send(errorMessages.USER_LOGIN_FAILED_WRONG_CREDENTIALS)
  }
})

module.exports = router