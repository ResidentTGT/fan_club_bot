import { ObjectId } from "mongodb";
import { Event } from "./models.js";
import {
  getEvents,
  addEvent as saveEventToDb,
  disableEvent as disableEventInDb,
  addRecord,
  getRecords,
  deleteRecord,
  getRecord,
  findUser,
  getArrival,
  addArrival,
} from "./mongo.js";

const viewActiveEvents = async (bot, chatId) => {
  const events = await getEvents({ active: true });

  const message = events.length
    ? events
        .map(
          (event) =>
            `Название: ${event.name}, активное: ${
              event.active ? "Да" : "Нет"
            }, дата/время: ${event.datetime}, место встречи: ${event.place}`
        )
        .join("\n")
    : "Активных встреч не найдено.";

  await bot.sendMessage(chatId, message);
};

const addEvent = async (bot, chatId) => {
  await bot
    .sendMessage(chatId, "Введи название события:", {
      reply_markup: JSON.stringify({
        force_reply: true,
      }),
    })
    .then(async (msg) => {
      await bot.onReplyToMessage(chatId, msg.message_id, async (reply) => {
        const newEvent = new Event(reply.text);

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
                        await saveEventToDb(newEvent);
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

const handleDisableEventButton = async (bot, chatId) => {
  const events = await getEvents({ active: true });

  if (events && events.length) {
    await bot.sendMessage(chatId, "Какую встречу сделать неактивной?", {
      reply_markup: {
        inline_keyboard: events.map((e) => {
          return [
            {
              text: e.name,
              callback_data: JSON.stringify({
                method: "disableEvent",
                eventId: e._id,
              }),
            },
          ];
        }),
      },
    });
  } else {
    await bot.sendMessage(chatId, "На данный момент нет активных встреч.");
  }
};

const disableEvent = async (bot, chatId, queryData) => {
  await disableEventInDb(queryData.eventId);
  await bot.sendMessage(chatId, `Событие теперь неактивно!`);
};

const handleRegisterOnEventButton = async (bot, chatId) => {
  const events = await getEvents({ active: true });

  if (events && events.length) {
    await bot.sendMessage(chatId, "На какую встречу хочешь прийти?", {
      reply_markup: {
        inline_keyboard: events.map((e) => {
          return [
            {
              text: `${e.name} | ${e.datetime} | ${e.place}`,
              callback_data: JSON.stringify({
                method: "regOnEvent",
                eventId: e._id,
              }),
            },
          ];
        }),
      },
    });
  } else {
    await bot.sendMessage(chatId, "На данный момент нет активных встреч.");
  }
};

const handleCancelRegistrationButton = async (bot, chatId, userId) => {
  const records = await getRecords({ userId });

  const eventsIds = records.map((r) => ObjectId(r.eventId));

  const events = await getEvents({ _id: { $in: eventsIds } }, { active: true });

  if (events && events.length) {
    await bot.sendMessage(chatId, "На какую встречу отменить регистрацию?", {
      reply_markup: {
        inline_keyboard: events.map((e) => {
          return [
            {
              text: `${e.name} | ${e.datetime} | ${e.place}`,
              callback_data: JSON.stringify({
                method: "cancelReg",
                eventId: e._id,
              }),
            },
          ];
        }),
      },
    });
  } else {
    await bot.sendMessage(
      chatId,
      "Вы не зарегистрированы ни на одну из активных встреч."
    );
  }
};

const registerOnEvent = async (bot, chatId, userId, queryData) => {
  const records = await getRecords({ eventId: queryData.eventId });
  const record = records.find((r) => r.userId === userId);
  if (record) {
    await bot.sendMessage(chatId, `Вы уже зарегистрированы на это событие!`);
  } else {
    records.sort(function (a, b) {
      return a - b;
    });
    const number = records.length ? records[records.length - 1].number + 1 : 1;
    await addRecord(queryData.eventId, userId, number);
    await bot.sendMessage(
      chatId,
      `Вы зарегистрировались на событие! Ваш номер: ${number}.`
    );
  }
};

const cancelRegistration = async (bot, chatId, userId, queryData) => {
  await deleteRecord(queryData.eventId, userId);
  await bot.sendMessage(chatId, `Регистрация на событие отменена!`);
};

const handleMarkArrivalButton = async (bot, chatId) => {
  const events = await getEvents({ active: true });

  if (events && events.length) {
    await bot.sendMessage(chatId, "Какая встреча сейчас?", {
      reply_markup: {
        inline_keyboard: events.map((e) => {
          return [
            {
              text: `${e.name} | ${e.datetime} | ${e.place}`,
              callback_data: JSON.stringify({
                method: "markArrival",
                eventId: e._id,
              }),
            },
          ];
        }),
      },
    });
  } else {
    await bot.sendMessage(chatId, "На данный момент нет активных встреч.");
  }
};

const markArrival = async (bot, chatId, queryData) => {
  await bot
    .sendMessage(chatId, "Введи номер гостя:", {
      reply_markup: JSON.stringify({
        force_reply: true,
      }),
    })
    .then(async (msg) => {
      await bot.onReplyToMessage(chatId, msg.message_id, async (reply) => {
        const number = +reply.text;
        const record = await getRecord({
          eventId: queryData.eventId,
          number,
        });
        if (record) {
          const userId = record.userId;
          const user = await findUser(userId);
          const arrival = await getArrival(record.eventId, record.userId);
          if (arrival) {
            await bot.sendMessage(
              chatId,
              `Гость ${user.name} (@${user.telegramUsername}) уже был отмечен.`
            );
          } else {
            await addArrival(record.eventId, record.userId);
            await bot.sendMessage(
              chatId,
              `Гость ${user.name} (@${user.telegramUsername}) отмечен.`
            );
          }
        } else {
          await bot.sendMessage(
            chatId,
            `На данную встречу не зарегистрировано такого номера.`
          );
        }
      });
    });
};

const handleViewCountButton = async (bot, chatId) => {
  const events = await getEvents({ active: true });

  if (events && events.length) {
    await bot.sendMessage(chatId, "На какую встречу?", {
      reply_markup: {
        inline_keyboard: events.map((e) => {
          return [
            {
              text: `${e.name} | ${e.datetime} | ${e.place}`,
              callback_data: JSON.stringify({
                method: "viewCount",
                eventId: e._id,
              }),
            },
          ];
        }),
      },
    });
  } else {
    await bot.sendMessage(chatId, "На данный момент нет активных встреч.");
  }
};

const viewCount = async (bot, chatId, queryData) => {
  const records = await getRecords({ eventId: queryData.eventId });

  for (let i = 0; i < records.length; i++) {
    records[i].user = await findUser(records[i].userId);
  }

  await bot.sendMessage(
    chatId,
    `На событие зарегистрировано: ${
      records.length
    }.\nЗарегистрировавшиеся: ${records.map(
      (r) =>
        "\n" + r.user.name + " (@" + r.user.telegramUsername + "), №" + r.number
    )}`
  );
};

export {
  addEvent,
  handleDisableEventButton,
  viewActiveEvents,
  handleRegisterOnEventButton,
  disableEvent,
  registerOnEvent,
  handleCancelRegistrationButton,
  cancelRegistration,
  handleMarkArrivalButton,
  markArrival,
  handleViewCountButton,
  viewCount,
};
