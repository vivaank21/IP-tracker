
FROM node:22-alpine

WORKDIR /app

# Install tools needed to compile native Node.js modules
RUN apk add --no-cache python3 make g++

COPY package*.json ./

ENV NODE_ENV=production

RUN npm install --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
