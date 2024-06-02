const mongoose = require('mongoose');

const connectDB = () => {
    // Connect to mongoDB database
    const MONGODB_CONN_STR = process.env.MONGODB_CONN_STR || "mongodb://127.0.0.1:27017/chat"
    mongoose
    .connect(MONGODB_CONN_STR)
    .then((db) => {
        console.log(`Connected to ${MONGODB_CONN_STR}`)
    })
    .catch((error) => console.log(error))
}

module.exports = connectDB