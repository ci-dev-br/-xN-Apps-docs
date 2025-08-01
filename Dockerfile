ARG NODE_VERSION=20.17.0
ARG PNPM_VERSION=9.1.4
FROM node:${NODE_VERSION}-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY server/package*.json .
RUN npm install
COPY . .
EXPOSE 3333
CMD ["node", "dist/main"]