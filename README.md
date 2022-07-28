# Бот для встреч футбольного сообщества 
## Технические требования
- MongoDB
- NodeJS
## Установка на сервер
1. Арендовать удаленный сервер Ubuntu
2. Зайти на сервер через SSH ```ssh root@{ip}```
3. [Установить NodeJS и npm](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04-ru)
4. [Установить MongoDB]
5. ```git clone репозитория```
6. ```cd fan_club_bot```
7. В файл token.js вставить свой токен бота
8. ```npm i```
9. ```npm run start```
10. Бот запущен
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
