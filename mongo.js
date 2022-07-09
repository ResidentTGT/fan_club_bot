import { MongoClient } from "mongodb";

const url = "mongodb://localhost:27017/";
const dbName = "testdb";

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
  console.log(event);
  const insertResult = await events.insertOne(event);
  console.log("Inserted event =>", insertResult);
};

const getEvents = async () => {
  const client = new MongoClient(url);
  try {
    const database = client.db(dbName);
    const eventsCollection = database.collection("events");
    const events = await eventsCollection.find({}).toArray();
    console.log("Found events =>", events);
    return events;
  } catch (err) {
    console.log(err);
  }
};

const findUser = async (id) => {
  const client = new MongoClient(url);
  const user = await client
    .db(dbName)
    .collection("users")
    .findOne({ telegramUserId: id });

  console.log("Finded user =>", user);
  return user;
};

const addUser = async (user) => {
  const client = new MongoClient(url);
  const users = await client.db(dbName).collection("users");
  console.log(user);
  const insertResult = await users.insertOne(user);
  console.log("Inserted user =>", insertResult);
};

const deleteUsers = async () => {
  const client = new MongoClient(url);
  const users = await client.db(dbName).collection("users");
  await users.deleteMany({});
  console.log("All users were deleted!");
};
const getUsers = async () => {
  const client = new MongoClient(url);
  try {
    const database = client.db(dbName);
    const usersCollection = database.collection("users");
    const users = await usersCollection.find({}).toArray();
    console.log("Found users =>", users);
    return users;
  } catch (err) {
    console.log(err);
  }
};

export {
  connectToDatabase,
  getEvents,
  addEvent,
  findUser,
  addUser,
  getUsers,
  deleteUsers,
};
