class User {
  _id;
  admin = false;
  name;
  phone;

  constructor(telegramUserId, telegramUsername) {
    this.telegramUserId = telegramUserId;
    this.telegramUsername = telegramUsername;
  }
}

class Event {
  _id;
  active = true;
  place;
  datetime;

  constructor(name) {
    this.name = name;
  }
}

class Record {
  _id;
  eventId;
  userId;
  number;
}

class Arrival {
  _id;
  eventId;
  userId;
}

export { User, Event, Record, Arrival };
