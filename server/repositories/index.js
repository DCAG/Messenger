const usersRepo = require('./usersRepo')
const groupsRepo = require('./groupsRepo')
const chatRepo = require('./chatRepo')

//groupsRepo.create('Test','Test Group', new Date(),[1,2,3,4])
//groupsRepo.create('Odd','Odd Group', new Date(),[1,3,5,7])
//groupsRepo.create('Even','Even Group', new Date(),[2,4,6,8])
groupsRepo.getByUserId(3).then((x) => console.log(x))

// usersRepo.getByQuery("SELECT * FROM users").then((results) => {
//   console.log(results)
// })

// usersRepo.getAll().then((results) => {
//   console.log(results)
// })

// usersRepo.getById(21).then((results) => {
//   console.log(results)
// })

// usersRepo.getByUsername('sophia').then((results) => {
//   console.log(results)
// })

// usersRepo.getCredentials('sophia').then((results) => {
//   console.log(results)
// })