
#RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app


#COPY package*.json ./

#USER node


#COPY --chown=node:node . .

#ENV NODE_ENV=development -e NODE_ENV="development"

#EXPOSE 3000 --expose 3000
FROM node:22-alpine
WORKDIR /home/node/app
COPY . .
RUN npm install

CMD [ "node", "index.js" ]