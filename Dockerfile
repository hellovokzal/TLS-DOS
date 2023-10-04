FROM node:14

WORKDIR /app

RUN apt-get update && apt-get upgrade -y

RUN apt-get install -y git

RUN git clone https://github.com/hellovokzal/TLS-DOS .

RUN npm install

CMD ["node", "bot.js"]
