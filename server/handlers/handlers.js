const chatService = require('../services/chatService')
const groupsService = require('../services/groupsService')
const usersService = require('../services/usersService')

module.exports = (io) => {
  const createGroup = async function (payload) {
    const socket = this;
    const { name, description, members } = payload
    const group = await groupsService.create({ type: 'group', name, description, members })
    // NOTE: maybe join everyone and send group with messages directly?
    group.members.forEach((user) => {
      const userId = user._id
      // if they are connected notify them about new group. then they will join
      // if they are NOT CONNECTED - they will get all the groups data when they are connected
      io.to(`user:${userId}`).emit("group:invite", group) //group._id);
    })
  };
  const editGroup = async function (payload) {
    const socket = this;
    const { _id, name, description, members } = payload
    const oldGroup = await groupsService.getById(_id)
    const membersAdded = members.filter(m=>!oldGroup.members.find(om=>om._id==m))
    const membersRemoved = oldGroup.members.filter(m=>!members.includes(m._id.toString()))
    const group = await groupsService.update(_id, { type: 'group', name, description, members })
    // NOTE: instead maybe - send which members were removed so each will find himself and send a request to leave
    // here is a start to this idea: io.to(`group:${group._id}`).emit("group:leave", {group._id, members: membersRemoved})
    membersRemoved.forEach((userId) => {
      io.to(`user:${userId}`).emit("group:leave", group._id);
    })
    membersAdded.forEach((userId) => {
      // if they are connected notify them about new group. then they will join
      // if they are NOT CONNECTED - they will get all the groups data when they are connected
      io.to(`user:${userId}`).emit("group:invite", group._id);
    })
  };

  //region joinUserToGroup
  const joinUserToGroup = async function (groupId, messagesOffset=0) {
    const socket = this;
    const user = socket.request.user;
    const username = user?.user?.username
    const userId = user?.user?._id
    const group = await groupsService.getById(groupId)
    if(!group){
      console.warn(`attempt to join user ${username} to group non existent group: ${groupId}` )
      return
    }

    let chatDisplayName = group.name
    if(group.type == "contact"){ 
      chatDisplayName = group?.members?.find(m=>m._id!=userId)?.username??":unknown:" 
    }
    if(!group.members?.some(m=>m._id == userId)){
      console.warn(`attempt to join user ${username} to group ${chatDisplayName} which they are not member of` )
    }
    socket.join(`group:${groupId}`)
    console.log(`${user.user.username} joined '${chatDisplayName}' [${group._id}]`)
    const allMessages = await chatService.getAllRemainingMessages(groupId, messagesOffset)
    // TODO: test new chat here!!! 
    allMessages.forEach((message) => {
      io.to(`user:${userId}`).emit("chat:message", { groupId: groupId, ...message })
    })
  };

  const removeUserFromGroup = async function (groupId) {
    const socket = this;
    socket.leave(`group:${groupId}`)
  };
  const messageChat = async function (msgObject) {
    const socket = this;
    const user = socket.request.user;
    const userId = user?.user?._id
    const username = user?.user?.username
    const { groupId, type, content } = msgObject
    const targetGroup = await groupsService.getById(groupId)
    if(!targetGroup){
      console.warn(`user ${userId} tried to send message to group ${groupId} which does not exist`)
      return
    }
    if(!targetGroup.members.find(m=>m._id==userId)){
      console.warn(`user ${userId} tried to send message to group ${groupId} which he is not a member of`)
      return
    }
    const result = await chatService.writeMessage(groupId, userId, content)
    const result2 = await chatService.getAllRemainingMessages(groupId, result.lastID - 1)
    // in case the group is new
    io.to(`group:${groupId}`).emit("message:received", { groupId, ...result2[0] })
    //socket.to(`group:${groupId}`, { sender: {id, username}, content })
  };
  const messageNewChat = async function (msgObject) {
    const socket = this;
    const user = socket.request.user;
    const userId = user?.user?._id
    const username = user?.user?.username
    let groups = await groupsService.getByUserId(userId) ?? []
    const { groupId: targetId, type, content } = msgObject
    let group = groups.find(g => g.type == 'contact' && g.members.includes(targetId))
    if (!group) {
      //direct - contact
      const newGroup = {
        type: 'contact',
        description: '',
        name: '',
        members: [userId, targetId]
      }
      group = await groupsService.create(newGroup) // create if doesn't exist
      group = await groupsService.getById(group._id) // populated with users
    }

    const writeMsgResult = await chatService.writeMessage(group._id, userId, content)
    // const loggedMessage = await chatService.getAllRemainingMessages(group._id, writeMsgResult.lastID - 1)
    
    group.members.forEach(async (member) => {
      // client will register group, request to join and fetch messages
      io.to(`user:${member._id}`).emit("group:invite", group);
    })
    
    // io.to(`group:${groupId}`).emit("message:received", { groupId, ...loggedMessage[0] })
    // redirect anyway...
    socket.emit('chat:redirect', group._id)
  };
  const fetchChatHistory = async function (groupsIds) {
    const socket = this;
    groupsIds.forEach(async (gid) => {
      const messages = await chatService.getAllMessages(gid)
      if (messages) {
        messages.forEach(msg => {
          socket.emit('chat:message', { ...msg, groupId: gid })
        })
      }
    })
  };
  const blockUser = function () {
    const socket = this;
  };
  const getAllContacts = async function () {
    const socket = this;
    const contacts = await usersService.getAll();
    socket.emit('contacts:received', contacts)
  }

  const getAllUserGroups = async function () {
    const socket = this;
    const socketUser = socket?.request?.user;
    const socketUserId = socketUser?.user?._id
    const groups = await groupsService.getByUserId(socketUserId) ?? []
    socket.emit('groups:received', groups)
    
  }

  return {
    getAllUserGroups,
    createGroup,
    editGroup,
    joinUserToGroup,
    removeUserFromGroup,
    messageChat,
    messageNewChat,
    fetchChatHistory,
    blockUser,
    getAllContacts
  }
}