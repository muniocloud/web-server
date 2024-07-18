FROM node:lts-alpine3.20 AS base
WORKDIR /usr/app/
EXPOSE 8080

COPY . .

RUN chown -R node:node .

USER node

RUN npm ci

RUN npm run build

ENTRYPOINT npm run migration:up && npm run start:prod
