const jwtauth = require('./middleware/jwtauth')
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
app.use('/self', jwtauth, selfController);

const io = new Server(httpServer);

const port = process.env.SERVER_PORT || 3000;
httpServer.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});

// Serve Client:
// const { join } = require("node:path");
// app.get("/", (req, res) => {
//   res.sendFile(join(__dirname, "index.html"));
// });