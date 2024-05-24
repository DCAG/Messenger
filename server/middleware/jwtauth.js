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
    const authorization = req.headers['authorization']
    // Checking if authorization header is present
    if (!authorization) {
        console.log('authorization header is missing')
        return res.status(403).send(
            errorMessages.
                RESTRICTED_PAGE_ACCESS_MISSING_TOKEN(req.originalUrl)
        )
    }
    // console.log("authorization header is present", authorization)
    // authorization expected to be 'Bearer "token"'
    // Removing 'Bearer ' prefix to get the token
    const token = authorization.replace("Bearer ", "");

    //Verifying if the token is valid.
    jwt.verify(token, JWT_SECRET, (error, payload) => {
        if (error) {
            return res.status(403).send(
                errorMessages.
                    RESTRICTED_PAGE_ACCESS_INVALID_TOKEN(error)
            )
        }

        req.user = payload;
        next();
    });
};

const socketJWT = (socket, next) => {
    const token = socket.handshake.auth.token;

    if(!token){
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
    jwt.verify(token, JWT_SECRET, (error, payload) => {
        if (error) {
            const err = new Error("not authorized");
            err.data = { content: errorMessages.
                RESTRICTED_PAGE_ACCESS_INVALID_TOKEN(error) }; // additional details
            next(err);
        }

        socket.request.user = payload;
        next();
    });
}

module.exports = { httpJWT, socketJWT }