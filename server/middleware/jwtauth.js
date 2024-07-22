const jwt = require('jsonwebtoken');
const errorMessages = require('../utils/errorMessages');

/**
 * JWT Authentication middleware
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns output of next middleware call
 */
const httpJWT = (req, res, next) => {
  // Extracting JWT secret from environment variable
  const JWT_SECRET = process.env.JWT_SECRET;
  // Extracting token from authorization header
  const authHeader = req.headers['authorization']
  // Checking if authorization header is present
  if (!authHeader) {
    //RESTRICTED_PAGE_ACCESS_MISSING_TOKEN
    const error = new Error('Not authenticated')
    error.statusCode = 401;
    error.longMessage = 'This page is accessible only to users who are logged in. If you are logged in already please send the request with the authorization token.'
    error.action = {
      type: "retry",
      to: req.originalUrl
    }
    throw error
  }
  // authorization expected to be 'Bearer "token"'
  // Removing 'Bearer ' prefix to get the token
  const token = authHeader.replace("Bearer ", "");

  //Verifying if the token is valid.
  jwt.verify(token, JWT_SECRET, (error, decodedToken) => {
    if (error) {
      error.statusCode = 500;
      error.longMessage = 'This page is accessible only to users who are logged in with a valid(!) token.';
      error.action = { // suggested action
        type: "redirect",
        to: "login"
      }
      throw error;
      // return res.status(403).send(
      //     errorMessages.
      //         RESTRICTED_PAGE_ACCESS_INVALID_TOKEN(error)
      // )
    }
    if (!decodedToken) {
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      throw error;
    }
    req.userId = decodedToken._id;
    next();
  });
};

const socketJWT = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    const err = new Error("not authorized")
    err.data = {
      content: errorMessages.
        RESTRICTED_PAGE_ACCESS_MISSING_TOKEN(socket.request.url)
    }
    next(err)
    return;
  }

  // Extracting JWT secret from environment variable
  const JWT_SECRET = process.env.JWT_SECRET;

  //Verifying if the token is valid.
  jwt.verify(token, JWT_SECRET, (error, decodedToken) => {
    if (error) {
      const err = new Error("not authorized");
      err.data = {
        content: errorMessages.
          RESTRICTED_PAGE_ACCESS_INVALID_TOKEN(error)
      }; // additional details
      next(err);
    }

    socket.request.userId = decodedToken.user._id;
    next();
  });
}

module.exports = { httpJWT, socketJWT }