import React from 'react'
import { Link } from 'react-router-dom'

function NewChat() {
  const contacts = Object.groupBy([
    { "id": "1", "name": "Amir" },
    { "id": "2", "name": "Alice" },
    { "id": "3", "name": "Julia" },
    { "id": "4", "name": "Eitan" },
    { "id": "5", "name": "Liam" },
    { "id": "6", "name": "Olivia" },
    { "id": "7", "name": "Noah" },
    { "id": "8", "name": "Emma" },
    { "id": "9", "name": "Sophia" },
    { "id": "10", "name": "Elijah" },
    { "id": "11", "name": "Ava" },
    { "id": "12", "name": "James" },
    { "id": "13", "name": "Isabella" },
    { "id": "14", "name": "Benjamin" },
    { "id": "15", "name": "Mia" },
    { "id": "16", "name": "Lucas" },
    { "id": "17", "name": "Charlotte" },
    { "id": "18", "name": "Alexander" },
    { "id": "19", "name": "Amelia" },
    { "id": "20", "name": "William" },
    { "id": "21", "name": "Harper" },
    { "id": "22", "name": "Michael" },
    { "id": "23", "name": "Evelyn" },
    { "id": "24", "name": "Daniel" },
    { "id": "25", "name": "Abigail" },
    { "id": "26", "name": "Henry" },
    { "id": "27", "name": "Emily" },
    { "id": "28", "name": "Matthew" },
    { "id": "29", "name": "Elizabeth" },
    { "id": "30", "name": "Joseph" },
    { "id": "31", "name": "Sofia" },
    { "id": "32", "name": "David" },
    { "id": "33", "name": "Avery" },
    { "id": "34", "name": "Andrew" },
    { "id": "35", "name": "Ella" },
    { "id": "36", "name": "Christopher" },
    { "id": "37", "name": "Scarlett" },
    { "id": "38", "name": "Joshua" },
    { "id": "39", "name": "Grace" },
    { "id": "40", "name": "Logan" },
    { "id": "41", "name": "Chloe" },
    { "id": "42", "name": "Samuel" },
    { "id": "43", "name": "Victoria" },
    { "id": "44", "name": "John" },
    { "id": "45", "name": "Lily" },
    { "id": "46", "name": "Ryan" },
    { "id": "47", "name": "Hannah" },
    { "id": "48", "name": "Nathan" },
    { "id": "49", "name": "Layla" },
    { "id": "50", "name": "Isaac" }
  ].sort((a, b) => a.name.localeCompare(b.name)), (item) => item.name[0])

  return (
    <div className='chat-window--area'>
      <h4>New Chat</h4>
      <h4>Select Contact</h4>
      <div className='new-chat--groupby'>
        {
          Object.keys(contacts).map(firstLetter => {
            return (
              <div>
                <p>{firstLetter}</p>
                <div className='new-chat--contacts'>
                  {
                    contacts[firstLetter].map(contact => {
                      return (
                        <Link to={'/' + contact.id}>{contact.name}</Link>
                      )
                    })
                  }
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default NewChat