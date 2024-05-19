const mongoose = require('mongoose')

const credsSchema = new mongoose.Schema(
    {
        username: {type:String, required:true, unique: true},
        password: {type:String},
        password_hash: {type:String},
    },
    {
        versionKey: false,
        timestamps: true // This adds `createdAt` and `updatedAt` fields
    }
)

const Credentials = mongoose.model('credentials', credsSchema, 'credentials')

module.exports = Credentials
