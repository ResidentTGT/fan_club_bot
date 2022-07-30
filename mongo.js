import { MongoClient, ObjectId } from "mongodb";

const url = "mongodb://0.0.0.0:27017/";
const dbName = "fan_club_db";

const connectToDatabase = async () => {
  const client = new MongoClient(url);
  try {
    await client.connect();
    await client.db(dbName).command({ ping: 1 });
    console.log("Connected successfully to server");
  } finally {
    await client.close();
  }
};

const addEvent = async (event) => {
  const client = new MongoClient(url);
  const events = await client.db(dbName).collection("events");

  const insertResult = await events.insertOne(event);
  console.log("Inserted event =>", insertResult);
};

const addRecord = async (eventId, userId, number) => {
  const client = new MongoClient(url);
  const records = await client.db(dbName).collection("records");

  const insertResult = await records.insertOne({ eventId, userId, number });
  console.log("Inserted record =>", insertResult);
};

const addArrival = async (eventId, userId) => {
  const client = new MongoClient(url);
  const arrivals = await client.db(dbName).collection("arrivals");

  const insertResult = await arrivals.insertOne({ eventId, userId });
  console.log("Inserted arrival =>", insertResult);
};

const getArrival = async (eventId, userId) => {
  const client = new MongoClient(url);
  const database = client.db(dbName);
  const arrivalsCollection = database.collection("arrivals");

  const arrival = await arrivalsCollection.findOne({ eventId, userId });

  return arrival;
};

const deleteRecord = async (eventId, userId) => {
  const client = new MongoClient(url);
  const records = await client.db(dbName).collection("records");

  await records.deleteOne({ eventId, userId });
};

const getEvents = async (filter) => {
  const client = new MongoClient(url);
  const database = client.db(dbName);
  const eventsCollection = database.collection("events");

  const events = await eventsCollection.find(filter ? filter : {}).toArray();

  return events;
};

const getRecords = async (filter) => {
  const client = new MongoClient(url);
  const database = client.db(dbName);
  const recordsCollection = database.collection("records");

  const records = await recordsCollection.find(filter ? filter : {}).toArray();

  return records;
};

const getRecord = async (filter) => {
  const client = new MongoClient(url);
  const database = client.db(dbName);
  const recordsCollection = database.collection("records");

  const record = await recordsCollection.findOne(filter ? filter : {});

  return record;
};

const findUser = async (id) => {
  const client = new MongoClient(url);

  const user = await client
    .db(dbName)
    .collection("users")
    .findOne({ telegramUserId: id });

  return user;
};

const addUser = async (user) => {
  const client = new MongoClient(url);
  const users = await client.db(dbName).collection("users");

  const insertResult = await users.insertOne(user);
  console.log("Inserted user =>", insertResult);
};

const disableEvent = async (eventId) => {
  const client = new MongoClient(url);

  const events = await client.db(dbName).collection("events");

  await events.findOneAndUpdate(
    { _id: ObjectId(eventId) },
    { $set: { active: false } }
  );
};

export {
  connectToDatabase,
  getEvents,
  addEvent,
  findUser,
  addUser,
  disableEvent,
  addRecord,
  getRecords,
  deleteRecord,
  getRecord,
  addArrival,
  getArrival,
};
