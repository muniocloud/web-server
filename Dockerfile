FROM node:20.16-alpine3.19 AS base

WORKDIR /usr/app

EXPOSE 8080

COPY . .

RUN chown -R node:node .

USER node

RUN npm ci

RUN npm run build

ENV NODE_ENV='production'

ENTRYPOINT npm run migration:up:prod && npm run start:prod