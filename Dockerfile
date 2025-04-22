FROM node:20
WORKDIR /usr/src/app
COPY server/package*.json ./
RUN npm install
COPY server/dist/main.js ./dist
RUN node dist/main.js
EXPOSE 86,446,664
CMD ["node", "dist/main"]