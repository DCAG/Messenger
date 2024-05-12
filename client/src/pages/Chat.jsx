import React, {useState, useRef} from 'react'
import { useParams } from 'react-router-dom'
import groupLogo from '../assets/group-small.png'
import contactLogo from '../assets/contact-small.png'

const CHAT_TYPES = {
  'contact':contactLogo,
  'group':groupLogo,
}

function Chat() {
  const chatsList = [
    {id: '1', type: 'contact', name: 'Alice'},
    {id: '2', type: 'contact', name: 'Julia'},
    {id: '3', type: 'group', name: 'Beit-Beit'},
    {id: '4', type: 'group', name: 'Bnei Dodim'},
    {id: '5', type: 'contact', name: 'Eitan'},
    {id: '6', type: 'contact', name: 'Dafna'},
  ]
  const isGroupChat = true
  const thisUser = 'Amir'
  const conversation = [
    {id:'1',sender:'Amir',message:'First!'},
    {id:'2',sender:'Alice',message:'Second!'},
    {id:'3',sender:'Amir',message:'The fox is a clever animal.'},
    {id:'4',sender:'Alice',message:'The curious cat explored the mysterious garden, its eyes wide with wonder.'},
    {id:'5',sender:'Amir',message:'First!'},
    {id:'6',sender:'Alice',message:'Second!'},
    {id:'7',sender:'Amir',message:'The fox is a clever animal.'},
    {id:'8',sender:'Alice',message:'The curious cat explored the mysterious garden, its eyes wide with wonder.'},
    {id:'9',sender:'Amir',message:'ראשון!'},
    {id:'10',sender:'Alice',message:'שניה!'},
    {id:'11',sender:'Amir',message:'השועל הוא חיה חכמה.'},
    {id:'12',sender:'Alice',message:'The curious cat explored the mysterious garden, its eyes wide with wonder.'},
  ]
  const {id} = useParams()
  const chatItem = chatsList.find(item=>item.id==id)??null
  const messageFormRef = useRef()
  const handleSubmit = (e) => {
    e.preventDefault()
    // Send the message...
    // Reset messagebox
    messageFormRef.current.reset()
  }
  const [messageBoxTextRTL, setMessageBoxTextRTL] = useState(false)
  return (
    <div className='chat-window--area'>
      <div className='chat-window--header'>
        <img src={CHAT_TYPES[chatItem.type]} style={{width:'32px'}} alt={`${chatItem.type} image`} />
        <span>
        {chatItem.name}
        </span>
      </div>
      <div className='conversation'>
        <ul className='messages-list'>
          {
            conversation.map(item => {
              return (
                <li key={item.id} className={thisUser==item.sender?'message message-me':'message message-others'} style={/^[\u0590-\u05fe]+/.test(item.message)?{direction:'rtl'}:{}}>
                  <span style={(!isGroupChat || thisUser==item.sender)?{display:'none'}:{}} className='message-sender--title'>{item.sender} <br /></span>
                  <span>{item.message}</span>
                </li>
              )
            })
          }
        </ul>
      </div>
      <div className='chat-window--footer'>
        <form action="" onSubmit={handleSubmit} ref={messageFormRef}>
          <input id="messagebox" type="text" onChange={e=>setMessageBoxTextRTL(/^[\u0590-\u05fe]+/.test(e.target.value))} style={messageBoxTextRTL?{direction:'rtl'}:{}} />
          <button id="sendbutton" type='submit'>{"\u2B9E"}</button>
        </form>
      </div>
    </div>
  )
}

export default Chat