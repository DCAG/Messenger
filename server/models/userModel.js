const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        //NOTE: _id is set manually to be the same as creds model
        _id: {type: mongoose.Schema.Types.ObjectId, ref: 'creds'},
        username: {type:String, required:true, unique: true},
        nickname: {type:String},
        firstName: {type:String},
        lastName: {type:String},
        bio: {type:String},
        status: {type:String},
        blockedList: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    },
    {
        versionKey: false,
        timestamps: true, // This adds `createdAt` and `updatedAt` fields
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

userSchema.virtual('chats', {
    ref: 'chat',
    localField: '_id',
    foreignField: 'members', // field in other model pointing to this model
  });

const User = mongoose.model('user', userSchema, 'users')

module.exports = User
