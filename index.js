const TelegramBot = require("node-telegram-bot-api");

const token = "5577700750:AAFqXVtEfiin_jqKaDRmuWgUuNkVOZmKxBw";

const bot = new TelegramBot(token, { polling: true });

const keyboard = [
  [
    {
      text: "Добавить событие",
      callback_data: "addEvent",
    },
  ],
  [
    {
      text: "Посмотреть все события",
      callback_data: "viewEvents",
    },
  ],
  [
    {
      text: "Перейти на сайт",
      url: "https://yandex.ru",
    },
  ],
];

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Привет, Друг! чего хочешь?", {
    reply_markup: {
      inline_keyboard: keyboard,
    },
  });
});

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;

  // let img = '';

  // if (query.data === 'moreKeks') { // если кот
  //     img = 'keks.png';
  // }

  // if (query.data === 'morePes') { // если пёс
  //     img = 'pes.png';
  // }

  // if (img) {
  //     bot.sendPhoto(chatId, img, { // прикрутим клаву
  //         reply_markup: {
  //             inline_keyboard: keyboard
  //         }
  //     });
  // } else {
  bot.sendMessage(chatId, "Непонятно, давай попробуем ещё раз?", {
    // прикрутим клаву
    reply_markup: {
      inline_keyboard: keyboard,
    },
  });
  // }
});
