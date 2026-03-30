FROM node:14

WORKDIR /app

COPY . .

RUN npm install node-telegram-bot-api

CMD ["node", "bot.js"]
