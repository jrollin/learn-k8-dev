# The build image
FROM node:lts-alpine AS build
WORKDIR /app
COPY package*.json /app
COPY . /app
RUN npm ci 
 
# The production image
FROM node:lts-alpine
WORKDIR /app
USER node
EXPOSE 8080
COPY --chown=node:node --from=build /app /app
CMD ["node", "index.js"]
