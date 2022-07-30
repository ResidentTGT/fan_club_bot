import { User } from "./models.js";
import { findUser, addUser } from "./mongo.js";

const registerUser = async (msg, bot) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const newUser = new User(userId, msg.from.username);

  await bot.sendMessage(
    chatId,
    "Привет, добро пожаловать в фан-клуб Moscow Blues! Здесь ты можешь смотреть регистрации на предстоящие мероприятия, регистрироваться на них и смотреть актуальный список записавшихся. "
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
            `Отлично, ${reply.text}! А теперь контактный телефон для связи (его мы записываем на всякий случай). `,
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
                  `Великолепно! Теперь ты зарегистрирован в базе членов Moscow Blues, а значит, можешь записываться на предстоящие мероприятия.`
                );
              }
            );
          });
      });
    });
};

const handleUserStart = async (msg, bot) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const user = await findUser(userId);

  if (user) {
    await bot.sendMessage(
      chatId,
      `Привет, ${user.name}. Рады твоему возвращению!`
    );
  } else {
    await registerUser(msg, bot);
  }
};

export { registerUser, handleUserStart };
