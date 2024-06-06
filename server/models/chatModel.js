const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['private', 'group'],
      default: 'private',
    },
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    members: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

const Credentials = mongoose.model('chat', chatSchema, 'chats')

module.exports = Credentials
