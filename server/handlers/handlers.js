const chatService = require('../services/chatService')
const groupsService = require('../services/groupsService')
const usersService = require('../services/usersService')
require('../utils/types')

module.exports = (io) => {
  const getMyProfile = async function () {
    const socket = this;
    const contact = await usersService.getByUsername(socket.request.user.user.username);
    socket.emit('profile:received', contact)
  }

  const getAllContacts = async function () {
    const socket = this;
    const contacts = await usersService.getAll();
    socket.emit('contacts:received', contacts)
  }

  const getAllUserGroups = async function () {
    const socket = this;
    const socketUser = socket?.request?.user;
    const socketUserId = socketUser?.user?._id
    // get all chats
    const groups = await groupsService.getByUserId(socketUserId) ?? []
    // socket.emit('chats:received', groups)

    // join all groups chats and unblocked private chats
    const user = await usersService.getByUsername(socketUser.user.username)
    const blockedList = user.blockedList
    // groups
    //   .filter(group => group.type !== 'private')
    //   .forEach(group => {
    //     socket.join(`chat:${group._id}`)
    //     console.debug(`join user ${socketUser.user.username} to chat ${group._id} (${group.name})`)
    //   })
    // groups
    //   .filter(group => group.type === 'private' &&
    //     !group.members.some(member => blockedList.includes(member._id)))
    //   .forEach(group => {
    //     socket.join(`chat:${group._id}`)
    //     console.debug(`join user ${socketUser.user.username} to chat ${group._id} (${group.name})`)
    //   })
    // shorter version (might be less readable)
    const unblockedGroups = groups.filter(group => {
      // if on private chat the other member is not in blocked list then join to the chat
      return group.type!=='private' ||
        !group.members.some(member=>blockedList.includes(member._id))
    })
    for(group of unblockedGroups){
      socket.join(`chat:${group._id}`)
      console.debug(`join user ${socketUser.user.username} to chat ${group._id} (${group.name})`)
    }
    // sending the user only unblocked chats
    socket.emit('chats:received', unblockedGroups)
  }

  const createGroup = async function (payload) {
    const socket = this;
    const { name, description, members } = payload
    const group = await groupsService.create({ type: 'group', name, description, members })
    // NOTE: maybe join everyone and send group with messages directly?
    group.members.forEach((user) => {
      const userId = user._id
      // if they are connected notify them about new group. then they will join
      // if they are NOT CONNECTED - they will get all the groups data when they are connected
      io.to(`user:${userId}`).emit("group:joined", group) //group._id);
    })
  };
  
  const editGroup = async function (payload) {
    const socket = this;
    const { _id, name, description, members } = payload
    const oldGroup = await groupsService.getById(_id)
    const membersAdded = members.filter(m => !oldGroup.members.find(om => om._id == m))
    const membersRemoved = oldGroup.members.filter(m => !members.includes(m._id.toString()))
    const group = await groupsService.update(_id, { type: 'group', name, description, members })
    // NOTE: instead maybe - send which members were removed so each will find himself and send a request to leave
    // here is a start to this idea: io.to(`group:${group._id}`).emit("group:removed", {group._id, members: membersRemoved})
    membersRemoved.forEach((userId) => {
      io.to(`user:${userId}`).emit("group:removed", group._id);
    })
    membersAdded.forEach((userId) => {
      // if they are connected notify them about new group. then they will join
      // if they are NOT CONNECTED - they will get all the groups data when they are connected
      io.to(`user:${userId}`).emit("group:joined", group._id);
    })
  };


  const removeUserFromGroup = async function (groupId) {
    const socket = this;
    socket.leave(`group:${groupId}`)
    console.debug(`user ${socket.request.user.user.username} left ${groupId}`)
  };

  /**
   * 
   * @param {NewMessage} message 
   * @emits 'message:received' 
   */
  const messageChat = async function (message) {
    const socket = this;
    const user = socket.request.user;
    const userId = user?.user?._id
    const { chatId, content } = message
    const chat = await groupsService.getById(chatId)
    if (!chat) {
      console.warn(`user ${userId} tried to send message to chat ${chatId} which does not exist`)
      return
    }
    if (!chat.members.find(member => member._id == userId)) {
      console.warn(`user ${userId} tried to send message to chat ${chatId} which he is not a member of`)
      return
    }
    console.log(`user ${userId} sent message to chat ${chatId} with the content ${content}`)
    const result = await chatService.writeMessage(chatId, userId, content)
    const messages = await chatService.getAllRemainingMessages(chatId, result.lastID - 1)
    io.to(`chat:${chatId}`).emit("message:received", { chatId, messages })
  };

  /**
   * 
   * @param {NewPrivateChatAndMessage} message 
   */
  const messageNewPrivateChat = async function (message) {
    // TODO: check if user is blocked!!! either direction!
    const socket = this;
    const socketUser = socket.request.user;
    const userId = socketUser?.user?._id
    const chats = await groupsService.getByUserId(userId) ?? []
    const { contactId, content } = message
    const user = await usersService.getById(userId)
    const contact = await usersService.getById(contactId)
    if (!contact) {
      // contact doesnt exist
      socket.emit('error', { content: `contact with id ${contactId} does not exist. messages cannot be sent to contacts that do not exist` })
      return
    }
    if (user.blockedList.map(b => b._id.toString()).includes(contactId)) {
      // user blocked contact
      socket.emit('error', { content: `contact with id ${contactId} is in your blocked list.` })
      return
    }
    let chat = chats.find(chat => chat.type == 'private' && chat.members.map(m => m._id.toString()).includes(contactId))
    if (!chat) {
      // chat doesn't exist - create it
      const newChat = {
        type: 'private',
        members: [userId, contactId]
      }
      chat = await groupsService.create(newChat)
      chat = await groupsService.getById(chat._id) // with populated members
    }

    // register message
    await chatService.writeMessage(chat._id, userId, content)

    // join users to chat room
    io.sockets.adapter.rooms.get(`user:${userId}`)?.forEach(socketId => {
      const targetSocket = io.sockets.sockets.get(socketId);
      targetSocket.join(`chat:${chat._id}`)
    })
    if (!contact.blockedList.map(b => b._id.toString()).includes(userId)) {
      // join contact to private chat room only if they did not block this user
      io.sockets.adapter.rooms.get(`user:${contactId}`)?.forEach(socketId => {
        const targetSocket = io.sockets.sockets.get(socketId);
        targetSocket.join(`chat:${chat._id}`)
      })
    }

    // update chats for all clients (add the new chat - if they didn't already have it)
    io.to(`chat:${chat._id}`).emit("chats:received", [].concat(chat))

    // redirect this user to chat - to use the shorter message flow
    socket.emit('chat:redirect', chat._id)
  };

  //region joinUserToGroup
  const joinUserToGroup = async function (groupId, messagesOffset = 0) {
    const socket = this;
    const user = socket.request.user;
    const username = user?.user?.username
    const userId = user?.user?._id
    const group = await groupsService.getById(groupId)
    if (!group) {
      console.warn(`attempt to join user ${username} to group non existent group: ${groupId}`)
      return
    }

    let chatDisplayName = group.name
    if (group.type == "contact") {
      chatDisplayName = group?.members?.find(m => m._id != userId)?.username ?? ":unknown:"
    }
    if (!group.members?.some(m => m._id == userId)) {
      console.warn(`attempt to join user ${username} to group ${chatDisplayName} which they are not member of`)
    }
    socket.join(`group:${groupId}`)
    console.log(`${user.user.username} joined '${chatDisplayName}' [${group._id}]`)
    const allMessages = await chatService.getAllRemainingMessages(groupId, messagesOffset)
    // TODO: test new chat here!!! 
    allMessages.forEach((message) => {
      io.to(`user:${userId}`).emit("message:received", { groupId: groupId, ...message })
    })
  };

  const getMessages = async function (chatId, clientOffset = 0) {
    const socket = this;
    const messages = await chatService.getAllRemainingMessages(chatId, clientOffset)
    socket.emit('message:received', { chatId, messages })
  }

  /**
   * 
   * @param {Array<String>} blockedList 
   */
  const updateBlockedList = async function (blockedList) {
    const socket = this;
    const socketUser = socket?.request?.user;
    const user = await usersService.getById(socketUser.user._id)
    const unblockedContactsIds = user.blockedList.filter(contactId => !blockedList.includes(contactId.toString()))
    user.blockedList = [...new Set(blockedList)]
    // update user profile with new list
    const updatedUser = await usersService.update(user._id, user)
    socket.emit('profile:received', updatedUser)
    // get all **private** chats with blocked contacts AND unblocked contacts
    const chats = await groupsService.getByUserId(socketUser.user._id)
    const blockedChatsIds = chats.filter(c => c.type == 'private' && c.members.some(m => blockedList.includes(m._id.toString()))).map(c => c._id.toString())
    const unblockedChats = chats.filter(c => c.type == 'private' && c.members.some(m => unblockedContactsIds.map(id=>id.toString()).includes(m._id.toString())))

    // leave all chats with blocked contacts
    blockedChatsIds.forEach(chatId => socket.leave(`chat:${chatId}`))
    // remove all these chats on client
    socket.emit('chats:removed', [].concat(blockedChatsIds))

    // join and update client on all unblocked chats
    unblockedChats.forEach(chat => socket.join(`chat:${chat._id}`))
    socket.emit('chats:received', unblockedChats)
  };


  return {
    getMyProfile,
    getAllContacts,
    getAllUserGroups,
    getMessages,
    createGroup,
    editGroup,
    joinUserToGroup,
    removeUserFromGroup,
    messageChat,
    messageNewPrivateChat,
    updateBlockedList,
  }
}