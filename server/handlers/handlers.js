const messagesService = require('../services/messagesService')
const chatService = require('../services/chatService')
const usersService = require('../services/usersService')
require('../utils/types')

module.exports = (io) => {
  const getMyProfile = async function () {
    const socket = this;
    const contact = await usersService.getByUsername(socket.request.user.user.username);
    socket.emit('profile:received', contact)
  }

  const getContacts = async function () {
    const socket = this;
    const socketUser = socket?.request?.user;
    const socketUserId = socketUser?.user?._id
    const contacts = await usersService.getAll()
    const contactsExceptThisUser = contacts.filter(c => c._id != socketUserId)
    socket.emit('contacts:received', contactsExceptThisUser)

    // get online contacts
    const roomsIter = io.sockets.adapter.rooms.keys()
    let onlineContactsMap = {}
    for(const key of roomsIter){
      const matches = /user:(?<id>.+)/.exec(key)
      if(matches?.groups.id){
        onlineContactsMap[matches.groups.id] = matches.groups.id
      }
    }
    socket.emit('contacts:online', onlineContactsMap)
  }

  const getMyChats = async function () {
    const socket = this;
    const socketUser = socket?.request?.user;
    const socketUserId = socketUser?.user?._id
    // get all chats
    const chats = await chatService.getByUserId(socketUserId) ?? []
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
    const unblockedChats = chats.filter(chat => {
      // if on private chat the other member is not in blocked list then join to the chat
      return chat.type !== 'private' ||
        !chat.members.some(member => blockedList.includes(member._id))
    })
    for (const chat of unblockedChats) {
      socket.join(`chat:${chat._id}`)
      console.debug(`join user ${socketUser.user.username} to chat ${chat._id} (${chat.name})`)
    }
    // sending the user only unblocked chats
    socket.emit('chats:received', unblockedChats)
  }

  /**
   * 
   * @param {Chat} payload - (properties '_id', 'type' assumed missing), members property is a list of user ids (contact ids)
   */
  const createGroupChat = async function (payload) {
    const socket = this;
    const { name, description, members } = payload
    let chat = await chatService.create({ type: 'group', name, description, members })
    chat = await chatService.getById(chat._id) // with populated members

    // join users to chat room
    chat.members.forEach((member) => {
      const userId = member._id
      // get all instances of this user and join them
      io.sockets.adapter.rooms.get(`user:${userId}`)?.forEach(socketId => {
        const targetSocket = io.sockets.sockets.get(socketId);
        targetSocket.join(`chat:${chat._id}`)
      })
    })    
    // if they are connected notify them about new group. then they will join
    // if they are NOT CONNECTED - they will get all the groups data when they are connected
    io.to(`chat:${chat._id}`).emit("chats:received", [].concat(chat))
    // NOTE: race condition here?
    socket.emit('chat:redirect', chat._id)
  };

  /**
   * 
   * @param {Chat} payload - (property 'type' assumed missing) members property is a list of user ids (contact ids of type String)
   */
  const editGroupChat = async function (payload) {
    const socket = this;
    const { _id, name, description, members } = payload
    const oldChat = await chatService.getById(_id)
    const membersRemoved = oldChat.members.filter(m => !members.includes(m._id.toString()))
    const chat = await chatService.update(_id, { type: 'group', name, description, members })

    // update current members with new group data (and join new members to chat room. for previous members its OK, sockets cannot be joined twice to the same room.)
    chat.members.forEach((member) => {
      const userId = member._id
      
      // get all instances of this user and join them to this chat room
      io.sockets.adapter.rooms.get(`user:${userId}`)?.forEach(socketId => {
        const targetSocket = io.sockets.sockets.get(socketId);
        targetSocket.join(`chat:${chat._id}`)
      })

      // send group chat details - for the clients to add
      io.to(`user:${userId}`).emit("chats:received", [].concat(chat));
    })

    // remove old members from chat room
    membersRemoved.forEach((member) => {
      const userId = member._id
            
      // get all instances of this user and remove (leave) them to this chat room
      io.sockets.adapter.rooms.get(`user:${userId}`)?.forEach(socketId => {
        const targetSocket = io.sockets.sockets.get(socketId);
        targetSocket.leave(`chat:${chat._id}`)
      })

      // send group chat id - for the clients to remove
      io.to(`user:${userId}`).emit("chats:removed", [].concat(chat._id));
    })
  };


  const leaveChat = async function (chatId) {
    const socket = this;
    const socketUser = socket?.request?.user;
    const userId = socketUser?.user?._id
    const chat = (await chatService.getById(chatId)).toObject()
    chat.members = chat.members.map(member => member._id.toString()).filter(memberId => memberId != userId)
    editGroupChat(chat)
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
    const chat = await chatService.getById(chatId)
    if (!chat) {
      console.warn(`user ${userId} tried to send message to chat ${chatId} which does not exist`)
      return
    }
    if (!chat.members.find(member => member._id == userId)) {
      console.warn(`user ${userId} tried to send message to chat ${chatId} which he is not a member of`)
      return
    }
    console.log(`user ${userId} sent message to chat ${chatId} with the content ${content}`)
    const result = await messagesService.writeMessage(chatId, userId, content) 
    const messages = await messagesService.getAllRemainingMessages(chatId, result.lastID - 1)
    io.to(`chat:${chatId}`).emit("message:received", { chatId, messages })
  };

  /**
   * 
   * @param {NewPrivateChatAndMessage} message 
   */
  const messageNewPrivateChat = async function (message) {
    const socket = this;
    const socketUser = socket.request.user;
    const userId = socketUser?.user?._id
    const chats = await chatService.getByUserId(userId) ?? []
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
      chat = await chatService.create(newChat)
      chat = await chatService.getById(chat._id) // with populated members
    }

    // register message
    await messagesService.writeMessage(chat._id, userId, content)

    // join users to chat room
    // join all users' sessions to the chat room (other browser tabs and devices)
    // 1. user (this user)
    io.sockets.adapter.rooms.get(`user:${userId}`)?.forEach(socketId => {
      const targetSocket = io.sockets.sockets.get(socketId);
      targetSocket.join(`chat:${chat._id}`)
    })
    // 2. contact (target user)
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

  const getMessages = async function (chatId, clientOffset = 0) {
    const socket = this;
    const messages = await messagesService.getAllRemainingMessages(chatId, clientOffset)
    socket.emit('message:received', { chatId, messages: messages ?? [] })
  }

  /**
   * 
   * @param {Array<String>} blockedList 
   */
  const updateBlockedContacts = async function (blockedList) {
    const socket = this;
    const socketUser = socket?.request?.user;
    const user = await usersService.getById(socketUser.user._id)
    if(!user){
      // TODO: block/unblock/refresh contact in a new private chat and see why this craches: 
      console.error(`user with userId ${socketUser.user._id} was not found in the DB. DB was reset? hijacking websocket messages?`)
      return
    }
    const unblockedContactsIds = user.blockedList.filter(contactId => !blockedList.includes(contactId.toString()))
    user.blockedList = [...new Set(blockedList)]
    // update user profile with new list
    const updatedUser = await usersService.update(user._id, user)
    socket.emit('profile:received', updatedUser)
    // get all **private** chats with blocked contacts AND unblocked contacts
    const chats = await chatService.getByUserId(socketUser.user._id)
    const blockedChatsIds = chats.filter(c => c.type == 'private' && c.members.some(m => blockedList.includes(m._id.toString()))).map(c => c._id.toString())
    const unblockedChats = chats.filter(c => c.type == 'private' && c.members.some(m => unblockedContactsIds.map(id => id.toString()).includes(m._id.toString())))

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
    getContacts,
    getMyChats,
    getMessages,
    createGroupChat,
    editGroupChat,
    leaveChat,
    messageChat,
    messageNewPrivateChat,
    updateBlockedContacts,
  }
}