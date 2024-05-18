const usersRepo = require('./usersRepo')

// usersRepo.getByQuery("SELECT * FROM users").then((results) => {
//   console.log(results)
// })

// usersRepo.getAll().then((results) => {
//   console.log(results)
// })

usersRepo.getById(21).then((results) => {
  console.log(results)
})

// usersRepo.getByUsername('sophia').then((results) => {
//   console.log(results)
// })

// usersRepo.getCredentials('sophia').then((results) => {
//   console.log(results)
// })