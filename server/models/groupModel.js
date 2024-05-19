const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['direct', 'group'],
      default: 'direct',
    },
    name: { type: String },
    description: { type: String },
    members: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// //NOTE: do I need it to populate everytime?
// groupSchema.pre(/^find/, function(next) {
//   if (this.options._recursed) {
//     return next();
//   }
//   this.populate({
//     path: 'members',
//     options: { _recursed: true },
//     populate: {
//       path: '??????????????',
//       options: { _recursed: true },
//       transform: (doc,id) => {
//         if(doc==null){
//           return null
//         }
        
//         return {name: doc.name, _id: doc._id}
//       }
//     },
//   })
//   next();
// });

const Credentials = mongoose.model('group', groupSchema, 'groups')

module.exports = Credentials
