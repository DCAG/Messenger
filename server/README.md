# Messenger server

The server was built using NodeJS, Socket.io, mongodb (credentials, users data, chats metadata) and sqlite (chats message)

first time run: `npm install`

during development or testing can be run with `nodemon --env-file=.env.development index.js` or just `node index.js`

for production run:
in linux `NODE_ENV="production" node index.js`
in windows cmd `set NODE_ENV="production" node index.js`
in powershell `$env:NODE_ENV="production"; node index.js`

Notes:
    1. Since this is a project for demonstration purposes, there is a dummy data set in init folder with users and passwords. which are loaded when the server first starts - unless the flag `users-loaded.flag.txt` file exists.
    The init behavior can be set with these variables to reset messages (sqlite) and chats (mongoDB) as well:
    ```sh
    #delete the -flag.txt file and set this will delete all data in mongodb
    DROP_ALL_COLLECTIONS=1
    #drop all messages table in sqlite
    DROP_ALL_MESSAGES=1
    ```

    2. Credentials are stored in the mongodb in creds collectoin hashed and in plain text. the authentication process is using the hashed field! (again this is for demonstration and learning).

    3. to better understand the components of this server and application in general have a look at the [types.js](./utils/types.js) file. besides that there are a lot of comments (you decide if its too cluttering, enough or not enough for you... - its helped me gather my thoughts).

    The main components are:
        - creds/credentials - holds the credentials for each user - has a unique id.
        - user - has the same id of the matching creds object, and holds more details on the user that can be used for personalization.
        - chat - chat object with id, name, type (private or group), and members. can be extended with more data for personalization and user management.
        - messages tables (managed in sqlite) - each table name is matching single chat by its name (the name of the table is "c${chatId}"). to retrieve messages from the correct messages table - a.k.a to get the context of the chat a chat object must be retrieved first. there is no additional meta data (not even the name of the chat or the members of the chat specified in the messages tables).
        - message - each messages table consists of columns: id, senderId, content and timestamp (timestamp is generated automatically on INSERT)

    4. Core flows between client and server where described in graphs in [flows.drawio](./flows.drawio). use [draw.io plugin](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio) in vscode to view them.
