require('./env.config')
const { httpJWT, socketJWT } = require('./middleware/jwtauth')
const errorHandler = require('./middleware/error-handler')
const express = require("express");
const cors = require('cors')
const authController = require('./controllers/auth')
const selfController = require('./controllers/self')
const pingController = require('./controllers/ping')
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const connectMongoDB = require('./configs/mongodb')
const populateDB = require('./init/populateDB')
const mongoose = require('mongoose');
const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json())
app.use(errorHandler);
app.use('/auth', authController);
app.use('/self', httpJWT, selfController);
app.use('/ping', pingController);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.use(socketJWT);

const {
  getMyProfile,
  getContacts,
  getMyChats,
  getMessages,
  createGroupChat,
  editGroupChat,
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

  socket.on('disconnect', function() {
    const socket = this;
    const userId = socket.request.userId;
    console.log('user disconnected', userId)
    io.emit('contacts:offline', userId)
  });

  const userId = socket.request.userId;
  socket.join(`user:${userId}`);
  socket.broadcast.emit('contacts:online', { [userId]: userId })
}

io.on("connection", onConnection);

const port = process.env.SERVER_PORT;

connectMongoDB()
mongoose.connection.once('open', async () => {
  console.log('Connected to MongoDB');
  await populateDB()
  httpServer.listen(port, () => {
    console.log(`application is running at: http://${process.env.HOSTNAME || 'localhost'}:${port}`);
  });
})