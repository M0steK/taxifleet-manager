FROM node:18-alpine AS base

RUN apk update && apk add openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm install 

COPY src ./src

USER node
CMD [ "node", "src/index.js" ]
