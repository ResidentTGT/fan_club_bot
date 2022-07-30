# Бот для встреч футбольного сообщества 
## Технические требования
- Server Ubuntu 18+
- MongoDB
- NodeJS
## Установка на сервер
1. Арендовать удаленный сервер Ubuntu.
2. [Зарегистрировать телеграм-бота и получить токен](https://core.telegram.org/bots#3-how-do-i-create-a-bot)
3. Зайти на сервер через SSH ```ssh root@{server_ip}```
4. [Установить NodeJS и npm по инструкции](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04-ru) или выполнить команды ниже<br>
```cd ~```<br>
```curl -sL https://deb.nodesource.com/setup_18.x -o nodesource_setup.sh```<br>
```sudo bash nodesource_setup.sh```<br>
```sudo apt install nodejs```<br>
5. Установить Screen, чтобы бот продолжал работать после того, как мы отключимся от сервера ```apt -y install screen```
6. [Установить MongoDB](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/#install-mongodb-community-edition) и выполнить следующие команды
```systemctl enable mongod```
```systemctl start mongod```<br>
Проверка, что сервис базы запущен ```systemctl status mongod```
7. Идём в корень сервера ```cd ~``` и скачиваем репозиторий ```git clone https://github.com/ResidentTGT/fan_club_bot.git```
8. Запускаем утилиту Screen ```screen```
9. Идем в папку репозитория ```cd fan_club_bot```
10. В файл token.js вместо API_KEY вставляем токен бота, полученный на шаге 2. ```sed -i 's/""/"API_KEY"/' token.js```
11. Устанавливаем npm-пакеты ```npm i```
12. Запускаем бота ```npm run start```<br>
13. Если все хорошо, увидишь что-то такое
![image](https://user-images.githubusercontent.com/18449287/181778194-56a6bf34-7bb2-49be-bc3f-3c3a2c594704.png)
14. Если хотим, чтоб бот перезапускался при любой ошибке, надо выполнить следующие команды.<br>
Отключаем бота ```killall node```<br>
Копируем уже созданный файл сервиса из репозитория ```cp /root/fan_club_bot/fanclubbot.service /lib/systemd/system/```<br>
Сохраняем файл сервиса ```systemctl enable fanclubbot```<br>
Запускаем бота ```systemctl start fanclubbot```<br>
Готово. Теперь бот будет автоматически запускаться при старте сервера или при возникновении ошибок. Можно проверить это, завершив процесс node ```killall node```. Через 5 секунд бот автоматически перезапустится.

## Схемы таблиц БД
users (Пользователи)
```
{
  _id: ObjectId;
  telegramUserId: Int32;
  telegramUsername: String;
  name: String;
  admin: Boolean;
}
```
events (События/встречи)
```
{
  _id: ObjectId;
  name: String;
  place: String;
  datetime: String;
  active: Boolean;
}
```
records (Записи/регистрации на встречи)
```
{
  _id: ObjectId;
  eventId: String; // events._id
  userId: Int32; // users.telegramUserId
  number: Int32;
}
```
arrivals (Отметки прихода гостей на встречи)
```
{
  _id: ObjectId;
  eventId: String; // events._id
  userId: Int32; // users.telegramUserId
}
```
