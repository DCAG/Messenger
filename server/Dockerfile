FROM node:22-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

#ENV NODE_ENV=development -e NODE_ENV="development"

#EXPOSE 3000 --expose 3000

CMD [ "node", "index.js" ]