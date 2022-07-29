# Бот для встреч футбольного сообщества 
## Технические требования
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
```sudo apt install npm```
4. [Установить MongoDB](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/#install-mongodb-community-edition) и выполнить следующие команды
```systemctl enable mongod```
```systemctl start mongod```
```sudo reboot```<br>Последняя команда перезагружает сервер, поэтому ждём, подключаемся к серверу заново и идём дальше.
5. Идём в корень сервера ```cd ~``` и скачиваем репозиторий ```git clone git@github.com:ResidentTGT/fan_club_bot.git```
6. Идем в папку репозитория ```cd fan_club_bot```
7. В файл token.js вставляем токен бота, полученный на шаге 2.
8. Устанавливаем npm-пакеты ```npm i```
9. Запускаем бота ```npm run start```<br>
10. Если все хорошо, увидишь что-то такое
![image](https://user-images.githubusercontent.com/18449287/181778194-56a6bf34-7bb2-49be-bc3f-3c3a2c594704.png)

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
