FROM node:18-alpine AS base

RUN apk update && apk add openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm install 

COPY src ./src
COPY jest.config.js ./
COPY jest.setup.js ./
COPY .env.test ./

USER node
CMD [ "node", "src/index.js" ]
