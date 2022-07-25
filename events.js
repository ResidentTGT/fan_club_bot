import {
  getEvents,
  addEvent as saveEventToDb,
  disableEvent as disableEventInDb,
  addRecord,
  getRecords,
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
    : "Встреч не найдено.";

  await bot.sendMessage(chatId, message);
};

const addEvent = async (bot, chatId) => {
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

const registerOnEvent = async (bot, chatId, userId, queryData) => {
  const records = await getRecords({ eventId: queryData.eventId });
  const record = records.find((r) => r.userId === userId);
  if (record) {
    await bot.sendMessage(chatId, `Вы уже зарегистрированы на это событие!`);
  } else {
    const number = records.length + 1;
    await addRecord(queryData.eventId, userId, number);
    await bot.sendMessage(
      chatId,
      `Вы зарегистрировались на событие! Ваш номер: ${number}`
    );
  }
};

export {
  addEvent,
  handleDisableEventButton,
  viewActiveEvents,
  handleRegisterOnEventButton,
  disableEvent,
  registerOnEvent,
};
