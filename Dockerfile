FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

ENV PORT=3000
ENV ADMIN_KEY=admin2026

CMD ["node", "server.js"]
