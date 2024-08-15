const io = require('socket.io-client')
const axios = require('axios')
require('./env.config')

console.log(process.env)
console.log(process.env.ANTHROPIC_API_KEY)
axios.post(`${process.env.APP_BACKEND_URL}/auth/login`,{
  username: process.env.AI_USERNAME,
  password: process.env.AI_PASSWORD
}).then((response) => {
  console.log('response access token:' + response.data?.accessToken)
  // const accessToken = response.accessToken
  var socket = io.connect(process.env.APP_BACKEND_URL, {reconnect: true});
  socket.auth = { token: response.data.accessToken }
  socket.disconnect().connect();
  socket.on('connect', function () {
    // socket connected
    console.log('Connected!');
    // socket.emit('server custom event', { my: 'data' });
    socket.emit('contacts:get')
    socket.emit('chats:getMy')
    socket.emit('profile:getMy')
  });
  
  socket.on('error', (error) => {
    console.log(error);
  });


  const Anthropic = require("@anthropic-ai/sdk");
  const client = new Anthropic.Anthropic({apiKey:process.env.ANTHROPIC_API_KEY});
  const maxHistoryCount = process.env.MAX_HISTORY_COUNT || 50

  const conversationHistory = {}
  const chatsDetails = {}
  const contacts = {}


  const onContactsReceived = function(users) {
    console.log(users)
    users.forEach(user => {
      contacts[user._id] = user
    });
  }

  const onChatsReceived = function(myChats) {
    console.log(myChats)
    myChats.forEach(chat => {
      conversationHistory[chat._id] = {offset: 0, messages: []}
      chatsDetails[chat._id] = chat
      socket.emit("messages:get", chat._id)
    });
  }

  const isAssistant = (id) => {
    return id == process.env.AI_USER_ID
  }

  const onMessageReceived = async function(payload) {
    const chatId = payload.chatId
    // log all messages
    payload.messages.forEach((msg) => {
      // conversation history must alternate between assistant and user for valid api call.
      // so in case of a group chat if the @ai is not called, log an empty response from the assistant without creating an api call.
      if(conversationHistory[chatId]['offset'] < msg.id){ // make sure a message is not logged twice
        conversationHistory[chatId]['offset'] = msg.id

        const messageCount = conversationHistory[chatId]['messages'].length
        const role = isAssistant(msg.senderId) ? "assistant" : "user"
        const messageContent = (role == "user" ? `(${contacts[msg.senderId].username} says:)` : '') + msg.content
        const newMessage = {
          "role": role,
          "content": [{"type": "text","text": messageContent}]
        }
        const previousMessage = conversationHistory[chatId]['messages'][messageCount - 1]
        if(previousMessage?.role == "user" && newMessage.role == "user"){
          conversationHistory[chatId]['messages'].push({
            "role": "assistant",
            "content": [{"type": "text","text": "indeed"}]
          })
        }
        if(previousMessage?.role == "assistant" && newMessage.role == "assistant"){
          return // don't log the new message? //TODO: might want to do something else here. waiting for examples.
        }

        // log the message
        conversationHistory[chatId]['messages'].push(newMessage)
      }

      // first message must use the "user" role
      let effectiveHistoryCount = maxHistoryCount
      if(
        maxHistoryCount%2 == 1 && conversationHistory[chatId]['messages'].at(-1).role == "assistant" || // history count is even and current is assistant
        maxHistoryCount%2 == 0 && conversationHistory[chatId]['messages'].at(-1).role == "user" // history count is odd and current role is user
      ){
        effectiveHistoryCount = maxHistoryCount + 1
      }
      conversationHistory[chatId]['messages'] = conversationHistory[chatId]['messages'].slice(-effectiveHistoryCount)
    })

    // don't respond to own messages or messages without the @ai tag
    const userMessages = payload.messages.filter(msg => !isAssistant(msg.senderId))
    const lastMessage = conversationHistory[chatId]['messages'][conversationHistory[chatId]['messages'].length - 1]
    const lastOwnMessage = lastMessage?.role != undefined && lastMessage.role === 'assistant'
    const lastMessageText = lastMessage?.content[0].text
    console.log(lastMessageText)
    if(!userMessages.length || lastOwnMessage || (chatsDetails[chatId].type === 'group' && !lastMessageText.match(/@ai/))){
      return
    }

    const chatParticipants = chatsDetails[chatId].members.map(member => member.username).filter(username => username != 'claude')
    const systemPrompt = `You are Claude, an AI assistant, conversing via textual chat app. Besides you, there are ${chatParticipants.length} participants and their names are: ${chatParticipants.join(', ')}. Your context is configured to remember the last ${maxHistoryCount} (+/- 1) messages.`
    try{
      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1000,
        temperature: 0,
        // system: "Respond only with one line.",
        system: systemPrompt,
        messages: conversationHistory[chatId]['messages']
      });
      console.log(response.content[0]?.text);
      const newMessage = { chatId: chatId, content: response.content[0]?.text ?? '' }
      socket.emit('chat:message', newMessage)
    }
    catch(exception){
      console.log(exception)
      // TODO: implement error handling: https://docs.anthropic.com/en/api/errors
    }
  }

  // socket.on('disconnect', onDisconnect);
  // socket.on('profile:received', onProfileReceived)
  socket.on('contacts:received', onContactsReceived);
  // socket.on('contacts:online', onContactsOnline);
  // socket.on('contacts:offline', onContactsOffline);
  socket.on('chats:received', onChatsReceived);
  socket.on('message:received', onMessageReceived);
  // socket.on('chats:removed', onChatsLeave);
  // socket.on('chat:redirect', onChatRedirection);
})