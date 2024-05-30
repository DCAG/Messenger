const { httpJWT, socketJWT } = require('./middleware/jwtauth')
const express = require("express");
const cors = require('cors')
const authController = require('./controllers/auth')
const selfController = require('./controllers/self')
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const connectMongoDB = require('./configs/mongodb')
const groupsService = require('./services/groupsService')

connectMongoDB()
const app = express();
const httpServer = createServer(app);

app.use(cors())
app.use(express.json())
app.use('/auth', authController);
app.use('/self', httpJWT, selfController);

const io = new Server(httpServer,{
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.SERVER_PORT || 3000;
httpServer.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});

io.use(socketJWT);

const {
  getAllUserGroups,
  createGroup,
  editGroup,
  joinUserToGroup,
  removeUserFromGroup,
  messageChat,
  messageNewChat,
  fetchChatHistory,
  getMessages,
  blockContact,
  getAllContacts
} = require("./handlers/handlers")(io);

const onConnection = (socket) => {
  socket.on("group:create", createGroup);
  socket.on("group:edit", editGroup);
  socket.on("group:user-join", joinUserToGroup);
  socket.on("group:user-leave", removeUserFromGroup);
  socket.on("chat:message", messageChat);
  socket.on("chat:new:message", messageNewChat);
  socket.on("chat:fetch", fetchChatHistory);
  socket.on("messages:get", getMessages);
  socket.on("contacts:get", getAllContacts);
  socket.on("chats:getAllUser", getAllUserGroups);
  socket.on("contact:block", blockContact);
  
  const user = socket.request.user; 
  // const username = user.user.username
  const userId = user?.user?.id
  // // console.log("connected via socket.io!")
  // // console.log(user)
  socket.join(`user:${userId}`);
  // const groups = groupsService.getByUserId(userId)
  // user?.user?.groups?.forEach(async group => {
  //   // const fullGroup = groups.find(g=>g._id==group._id)
  //   const fullGroup = await groupsService.getById(group._id)
  //   socket.join(`group:${group._id}`)
  //   let chatDisplayName = group.name
  //   if(group.type == "contact"){
  //     chatDisplayName = fullGroup?.members?.find(m=>m._id!=userId)?.username??":unknown:" 
  //   }
  //   console.log(`${user.user.username} joined '${chatDisplayName}' [${group._id}]`)
  // })
}

io.on("connection", onConnection);

// Serve Client:
// const { join } = require("node:path");
// app.get("/", (req, res) => {
//   res.sendFile(join(__dirname, "index.html"));
// });