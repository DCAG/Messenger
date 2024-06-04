require('./env.config')
const { httpJWT, socketJWT } = require('./middleware/jwtauth')
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

connectMongoDB()
mongoose.connection.once('open', async () => {
  console.log('Connected to MongoDB');
  await populateDB()


  const app = express();
  const httpServer = createServer(app);

  app.use(cors());
  app.use(express.json())

  app.use('/auth', authController);
  app.use('/self', httpJWT, selfController);
  app.use('/ping', pingController);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const port = process.env.SERVER_PORT;
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

    socket.on('disconnect', () => {
      socket.broadcast.emit('contacts:offline', userId)
    });

    const user = socket.request.user;
    const userId = user?.user?.id
    socket.join(`user:${userId}`);
    socket.broadcast.emit('contacts:online', { [userId]: userId })
  }

  io.on("connection", onConnection);

})