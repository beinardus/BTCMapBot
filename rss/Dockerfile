FROM node:18-alpine AS base

WORKDIR /usr/rss
COPY ./package.json ./
RUN npm install --production

FROM base
WORKDIR /usr/rss
COPY ./src ./src

CMD ["npm", "start"]