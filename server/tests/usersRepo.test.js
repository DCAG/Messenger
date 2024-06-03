// const usersRepo = require('../repositories/usersRepo')

// describe('users repository - sqlite read access', () => {
//   test("getByQuery - get all users", async () => {
//     const data = await usersRepo.getByQuery("SELECT * FROM users")
//     expect(data.length).toBe(20)
//   });

//   test("getById - by id = 20 (expects username: thomas)", async () => {
//     const data = await usersRepo.getById(20)
//     expect(data.username).toBe('thomas')
//   });

//   test("getByUsername - by username = sophia (expect id 19)", async () => {
//     const data = await usersRepo.getByUsername('sophia')
//     expect(data.id).toBe(19)
//   });

//   test("getCredentials - by username = sophia (expect password)", async () => {
//     const data = await usersRepo.getCredentials('sophia')
//     expect(data.password).toBe('sunflower')
//   });

//   test("getById - by id = 21 (expects undefined)", async () => {
//     await expect(usersRepo.getById(21)).resolves.toBe(undefined)
//   });
// })