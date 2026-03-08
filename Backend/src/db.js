import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_CONNECTION_STRING;
const DB_NAME = "straitwatch_data";

let client = null;
let db = null;

export async function connectDb() {
  if (!uri) {
    throw new Error("Set MONGODB_CONNECTION_STRING in Backend/.env");
  }
  if (client) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(DB_NAME);
  try {
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
  } catch (e) {
    if (e.code !== 85 && e.code !== 86) console.warn("Users index:", e.message);
  }
  return db;
}

export function getDb() {
  if (!db) throw new Error("Database not connected. Call connectDb() first.");
  return db;
}
