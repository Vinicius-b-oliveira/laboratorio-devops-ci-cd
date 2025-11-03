FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm test

FROM node:18-alpine AS pruner

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .

RUN npm prune --production

FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=pruner /usr/src/app/node_modules ./node_modules
COPY --from=pruner /usr/src/app/package.json ./package.json
COPY --from=pruner /usr/src/app/server.js ./server.js

EXPOSE 3000

CMD [ "node", "server.js" ]
