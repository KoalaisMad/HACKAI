import "dotenv/config";
import { createReadStream } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { parse } from "csv-parse";
import { MongoClient } from "mongodb";

const __dirname = dirname(fileURLToPath(import.meta.url));
const csvPath = join(__dirname, "..", "..", "titlesCurrent.csv");

const uri = process.env.MONGODB_CONNECTION_STRING;
const DB_NAME = "straitwatch_data";
const COLLECTION_NAME = "news";

if (!uri) {
  console.error("Set MONGODB_CONNECTION_STRING in Backend/.env");
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const rows = [];
    const parser = createReadStream(csvPath)
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
          relax_column_count: true,
        })
      );

    for await (const row of parser) {
      if (row.title) {
        rows.push({
          title: row.title,
          date: row.date || null,
        });
      }
    }

    if (rows.length === 0) {
      console.log("No rows to insert. Check that titlesCurrent.csv exists and has a 'title' column.");
      return;
    }

    const result = await collection.insertMany(rows);
    console.log(`Inserted ${result.insertedCount} documents into ${DB_NAME}.${COLLECTION_NAME}`);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

run();
