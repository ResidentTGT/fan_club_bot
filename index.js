import TelegramBot from "node-telegram-bot-api";
import {
  connectToDatabase,
  getEvents,
  addEvent,
  findUser,
  addUser,
  deleteUsers,
  getUsers,
} from "./mongo.js";

const token = "5577700750:AAFqXVtEfiin_jqKaDRmuWgUuNkVOZmKxBw";

const bot = new TelegramBot(token, { polling: true });

await connectToDatabase();

// await deleteUsers();

const keyboard = [
  [
    {
      text: "Добавить встречу",
      callback_data: "addEvent",
    },
  ],
  [
    {
      text: "Посмотреть все активные встречи",
      callback_data: "viewEvents",
    },
  ],
  // [
  //   {
  //     text: "Записаться на встречу",
  //     callback_data: "registerOnEvent",
  //   },
  // ],
  [
    {
      text: "Перейти на сайт",
      url: "https://yandex.ru",
    },
  ],
];

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const user = await findUser(userId);

  if (user) {
    await bot.sendMessage(
      chatId,
      `Привет, ${user.name}. Рады твоему возвращению!`
    );
  } else {
    const newUser = {
      telegramUserId: userId,
      telegramUsername: msg.from.username,
    };
    await bot.sendMessage(
      chatId,
      "Приветствую, давай зарегистрируемся, чтобы ты мог записываться на встречи!"
    );
    await bot
      .sendMessage(chatId, "Как к тебе обращаться?", {
        reply_markup: JSON.stringify({
          force_reply: true,
        }),
      })
      .then(async (msg) => {
        await bot.onReplyToMessage(chatId, msg.message_id, async (reply) => {
          newUser.name = reply.text;
          await bot
            .sendMessage(
              chatId,
              `Отлично, ${reply.text}! А теперь контактный телефон для связи`,
              {
                reply_markup: JSON.stringify({
                  force_reply: true,
                }),
              }
            )
            .then(async (msg2) => {
              await bot.onReplyToMessage(
                chatId,
                msg2.message_id,
                async (reply2) => {
                  newUser.phone = reply2.text;
                  await addUser(newUser);
                  await bot.sendMessage(
                    chatId,
                    `Отлично, теперь ты можешь регистрироваться на встречи! Воспользуйся /menu, чтобы посмотреть доступные команды.`
                  );
                }
              );
            });
        });
      });
  }
});

bot.onText(/\/users/, async (msg) => {
  const chatId = msg.chat.id;

  const users = await getUsers();

  bot.sendMessage(
    chatId,

    users
      .map(
        (user) =>
          `Имя: ${user.name}, телефон: ${user.phone}, никнейм: ${user.telegramUsername}`
      )
      .join("\n")
  );
});

bot.onText(/\/menu/, async (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Чего хочешь?", {
    reply_markup: {
      inline_keyboard: keyboard,
    },
  });
});

const viewEvents = async (chatId) => {
  const events = await getEvents();

  bot.sendMessage(
    chatId,
    events
      .map(
        (event) =>
          `Название: ${event.name}, активное: ${
            event.active ? "Да" : "Нет"
          }, дата/время: ${event.datetime}, место встречи: ${event.place}`
      )
      .join("\n")
  );
};

const callEventAdding = async (chatId) => {
  const newEvent = { active: true };
  await bot
    .sendMessage(chatId, "Введи название события:", {
      reply_markup: JSON.stringify({
        force_reply: true,
      }),
    })
    .then(async (msg) => {
      await bot.onReplyToMessage(chatId, msg.message_id, async (reply) => {
        newEvent.name = reply.text;
        await bot
          .sendMessage(chatId, `Место проведения:`, {
            reply_markup: JSON.stringify({
              force_reply: true,
            }),
          })
          .then(async (msg2) => {
            await bot.onReplyToMessage(
              chatId,
              msg2.message_id,
              async (reply2) => {
                newEvent.place = reply2.text;

                await bot
                  .sendMessage(chatId, `Дата и время проведения:`, {
                    reply_markup: JSON.stringify({
                      force_reply: true,
                    }),
                  })
                  .then(async (msg3) => {
                    await bot.onReplyToMessage(
                      chatId,
                      msg3.message_id,
                      async (reply3) => {
                        newEvent.datetime = reply3.text;
                        await addEvent(newEvent);
                        await bot.sendMessage(chatId, `Событие добавлено!`);
                      }
                    );
                  });
              }
            );
          });
      });
    });
};

const callRegister = async (chatId) => {};

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;

  switch (query.data) {
    case "viewEvents":
      viewEvents(chatId);
      break;
    case "addEvent":
      callEventAdding(chatId);
      break;
    case "registerOnEvent":
      callRegister(chatId);
      break;
    default:
      bot.sendMessage(chatId, "Непонятно, давай попробуем ещё раз?", {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
  }
});
