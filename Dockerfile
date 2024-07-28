FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

RUN npm install

EXPOSE 3600
CMD [ "node", "index.js" ]

