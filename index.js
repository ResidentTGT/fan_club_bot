import TelegramBot from "node-telegram-bot-api";
import { TELEGRAM_API_TOKEN } from "./token.js";
import { connectToDatabase } from "./mongo.js";

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
} from "./events.js";
import { handleUserStart, getUsers } from "./users.js";

const bot = new TelegramBot(TELEGRAM_API_TOKEN, { polling: true });

await connectToDatabase();

// await deleteUsers();

bot.onText(/\/start/, async (msg) => {
  await handleUserStart(msg, bot);
});

bot.onText(/\/users/, async (msg) => {
  await getUsers(msg, bot);
});

bot.onText(/\/menu/, async (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Чего хочешь?", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Посмотреть все активные встречи",
            callback_data: JSON.stringify({ method: "viewEvents" }),
          },
        ],
        [
          {
            text: "Добавить встречу",
            callback_data: JSON.stringify({ method: "addEvent" }),
          },
        ],
        [
          {
            text: "Сделать встречу неактивной",
            callback_data: JSON.stringify({
              method: "handleDisableEventButton",
            }),
          },
        ],
        [
          {
            text: "Записаться на встречу",
            callback_data: JSON.stringify({
              method: "handleRegisterOnEventButton",
            }),
          },
        ],
        [
          {
            text: "Отменить запись на встречу",
            callback_data: JSON.stringify({
              method: "handleCancelRegistrationButton",
            }),
          },
        ],
        [
          {
            text: "Отметить приход на встречу",
            callback_data: JSON.stringify({
              method: "handleMarkArrivalButton",
            }),
          },
        ],
      ],
    },
  });
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
    default:
      bot.sendMessage(chatId, "Непонятно, давай попробуем ещё раз?", {
        reply_markup: {
          inline_keyboard: menuKeyboard,
        },
      });
  }
});
