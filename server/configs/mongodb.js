const mongoose = require('mongoose');

const connectDB = () => {
    // Connect to mongoDB database
    const mongoDBUris = process.env.MONGODB_CONN_STR.split(',')
    let p = Promise.reject(mongoDBUris)
    for(var i = 0; i < mongoDBUris.length; i++){
        p = p.catch( async (reason) => {
            console.log("attempting to connect to mongodb uri: " + reason[0])
            try{
                return await mongoose.connect(reason[0])
            }catch{
                if(reason.length > 1){
                    return Promise.reject(reason.splice(1))
                }
                else{
                    throw new Error('failed to connect to all provided mongodb addresses')
                }
            }
        })
    }
    p.then((db) => {
        console.log(`Connected to ${db.connections[0]._connectionString}`)
    })
    .catch((error) => console.log(error))
}

module.exports = connectDB