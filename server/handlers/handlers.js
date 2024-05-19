const chatService = require('../services/chatService')
const groupsService = require('../services/groupsService')
const usersService = require('../services/usersService')

module.exports = (io) => {
  const createGroup = async function(payload) {
    const socket = this;
    const {name, description, members} = payload
    const group = await groupsService.create(name, description, members)
    const groupMembers = await groupsService.getMembersById(group.lastID)
    groupMembers.map(x=>x.user_id).forEach((userId) => {
      // if they are connected notify them about new group. then they will join
      // if they are NOT CONNECTED - they will get all the groups data when they are connected
      io.to(`user:${userId}`).emit("group:invite", group.lastID);
    })
  };
  const joinUserToGroup = function(groupId) {
    const socket = this;
    const user = socket.request.user;
    const username = user?.user?.username
    socket.join(`group:${groupId}`)
    io.to(`group:${groupId}`).emit("chat:message", { sender: {id: -1, username: 'server'}, content: `${username} was added to the group` })
  };
  const messageChat = async function(groupId, senderUserId, content) {
    const socket = this;
    const result = await chatService.create(groupId, senderUserId, content)
    console.log(result)
    //socket.to(`group:${groupId}`, { sender: {id, username}, content })
  };
  const fetchChatHistory = function() {
    const socket = this;
  };
  const blockUser  = function() {
    const socket = this;
  };
  const getAllContacts = async () => {
    const socket = this;
    const contacts = await usersService.getAll();
    io.emit('contacts:received', contacts)
  }

  const createOrder = function (payload) {
    const socket = this; // hence the 'function' above, as an arrow function will not work
    // ...
  };

  const readOrder = function (orderId, callback) {
    // ...
  };

  return {
    createGroup,
    joinUserToGroup,
    messageChat,
    fetchChatHistory,
    blockUser,
    getAllContacts
  }
}