const { httpJWT, socketJWT } = require('./middleware/jwtauth')
const express = require("express");
const cors = require('cors')
const authController = require('./controllers/auth')
const selfController = require('./controllers/self')
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const connectMongoDB = require('./configs/mongodb')

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
  getMyProfile,
  getContacts,
  getMyChats,
  getMessages,
  createGroupChat,
  editGroupChat,
  // joinUserToGroup,
  leaveChat,
  messageChat,
  messageNewPrivateChat,
  updateBlockedContacts,
} = require("./handlers/handlers")(io);

const onConnection = (socket) => {
  socket.on("profile:getMy", getMyProfile);
  socket.on("contacts:get", getContacts);
  socket.on("chats:getMy", getMyChats);
  socket.on("messages:get", getMessages);
  socket.on("chat:group:create", createGroupChat);
  socket.on("chat:group:edit", editGroupChat);
  socket.on("chat:leave", leaveChat);
  socket.on("chat:message", messageChat);
  socket.on("chat:private:new:message", messageNewPrivateChat);
  socket.on("contacts:blocked:update", updateBlockedContacts);
  
  const user = socket.request.user; 
  const userId = user?.user?.id
  socket.join(`user:${userId}`);
}

io.on("connection", onConnection);

// Serve Client:
// const { join } = require("node:path");
// app.get("/", (req, res) => {
//   res.sendFile(join(__dirname, "index.html"));
// });