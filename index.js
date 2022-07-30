import TelegramBot from "node-telegram-bot-api";
import { TELEGRAM_API_TOKEN } from "./token.js";
import { connectToDatabase, findUser } from "./mongo.js";

import {
  addEvent,
  handleDisableEventButton,
  viewActiveEvents,
  handleRegisterOnEventButton,
  handleCancelRegistrationButton,
  disableEvent,
  registerOnEvent,
  cancelRegistration,
  markArrival,
  handleMarkArrivalButton,
  handleViewCountButton,
  viewCount,
} from "./events.js";
import { handleUserStart } from "./users.js";

const mainButtons = [
  {
    text: "Добавить мероприятие",
    public: false,
    callback_data: JSON.stringify({ method: "addEvent" }),
  },
  {
    text: "Удалить мероприятие",
    public: false,
    callback_data: JSON.stringify({
      method: "handleDisableEventButton",
    }),
  },
  {
    text: "Отметить пришедшего",
    public: false,
    callback_data: JSON.stringify({
      method: "handleMarkArrivalButton",
    }),
  },
  {
    text: "Предстоящие мероприятия",
    public: false,
    callback_data: JSON.stringify({ method: "viewEvents" }),
  },

  {
    text: "Записаться на мероприятие",
    public: true,
    callback_data: JSON.stringify({
      method: "handleRegisterOnEventButton",
    }),
  },
  {
    text: "Отменить запись на мероприятие ",
    public: true,
    callback_data: JSON.stringify({
      method: "handleCancelRegistrationButton",
    }),
  },
  {
    text: "Показать записавшихся",
    public: true,
    callback_data: JSON.stringify({
      method: "handleViewCountButton",
    }),
  },
];

const bot = new TelegramBot(TELEGRAM_API_TOKEN, { polling: true });

await connectToDatabase();

bot.onText(/\/start/, async (msg) => {
  await handleUserStart(msg, bot);
});

bot.onText(/\/menu/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const user = await findUser(userId);
  if (user) {
    const inlineKeyboard = user.admin
      ? mainButtons
      : mainButtons.filter((b) => b.public === true);

    bot.sendMessage(chatId, "Чего хочешь?", {
      reply_markup: {
        inline_keyboard: inlineKeyboard.map((x) => [x]),
      },
    });
  } else {
    bot.sendMessage(
      chatId,
      "Вы пока не зарегистрированы в фан-клубе. Нажми /start, чтобы зарегистрироваться."
    );
  }
});

bot.on("callback_query", (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;

  const queryData = JSON.parse(callbackQuery.data);

  switch (queryData.method) {
    case "addEvent":
      addEvent(bot, chatId);
      break;
    case "viewEvents":
      viewActiveEvents(bot, chatId);
      break;
    case "handleDisableEventButton":
      handleDisableEventButton(bot, chatId);
      break;
    case "disableEvent":
      disableEvent(bot, chatId, queryData);
      break;
    case "handleRegisterOnEventButton":
      handleRegisterOnEventButton(bot, chatId);
      break;
    case "handleCancelRegistrationButton":
      handleCancelRegistrationButton(bot, chatId, userId);
      break;
    case "regOnEvent":
      registerOnEvent(bot, chatId, userId, queryData);
      break;
    case "cancelReg":
      cancelRegistration(bot, chatId, userId, queryData);
      break;
    case "handleMarkArrivalButton":
      handleMarkArrivalButton(bot, chatId);
      break;
    case "markArrival":
      markArrival(bot, chatId, queryData);
      break;
    case "handleViewCountButton":
      handleViewCountButton(bot, chatId);
      break;
    case "viewCount":
      viewCount(bot, chatId, queryData);
      break;
    default:
      bot.sendMessage(chatId, "Непонятно, давай попробуем ещё раз?", {
        reply_markup: {
          inline_keyboard: menuKeyboard,
        },
      });
  }
});
