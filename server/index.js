const { httpJWT, socketJWT } = require('./middleware/jwtauth')
const express = require("express");
const cors = require('cors')
const authController = require('./controllers/auth')
const selfController = require('./controllers/self')
const { createServer } = require("node:http");
const { Server } = require("socket.io");

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
  createGroup,
  joinUserToGroup,
  messageChat,
  fetchChatHistory,
  blockUser,
  getAllContacts
} = require("./handlers/handlers")(io);

const onConnection = (socket) => {
  socket.on("group:create", createGroup);
  socket.on("group:user-join", joinUserToGroup);
  socket.on("chat:message", messageChat);
  socket.on("chat:fetch", fetchChatHistory);
  socket.on("user:blockUser", blockUser);
  socket.on("contacts:getAll", getAllContacts);


  const user = socket.request.user;
  const userId = user?.user?.id
  // console.log("connected via socket.io!")
  // console.log(user)
  socket.join(`user:${userId}`);
  io.to(`user:${userId}`).emit("foo", "bar");
  io.to(`user:${userId}`).emit("MESSAGE_RECEIVED", { id: '1', sender: 'Amir', message: user?.user?.username });  
  io.to(`user:${userId}`).emit("MESSAGE_RECEIVED", { id: '2', sender: 'Amir', message: 'First!1' });  
  io.to(`user:${userId}`).emit("MESSAGE_RECEIVED", { id: '3', sender: 'Amir', message: 'First!2' });  
  io.to(`user:${userId}`).emit("MESSAGE_RECEIVED", { id: '4', sender: 'Amir', message: 'First!3' });  
  io.to(`user:${userId}`).emit("MESSAGE_RECEIVED", { id: '5', sender: 'Amir', message: 'First!4' });  
}

io.on("connection", onConnection);

// Serve Client:
// const { join } = require("node:path");
// app.get("/", (req, res) => {
//   res.sendFile(join(__dirname, "index.html"));
// });