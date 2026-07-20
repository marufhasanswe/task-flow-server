import { MongoClient, Db, ServerApiVersion } from "mongodb";
import { env } from "../config/env.js";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db && client) {
    return db;
  }

  try {
    client = new MongoClient(env.MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();
    
    const isDev = process.env.NODE_ENV !== "production";
    db = client.db("task-flow");
    
    // Ping command to ensure connectivity
    await db.command({ ping: 1 });

    console.log(`[DB] Connected successfully to MongoDB (Env: ${isDev ? "Development" : "Production"})`);
    return db;
  } catch (error) {
    console.error("❌ [DB] Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error("Database not initialized. Call connectToDatabase() first.");
  }
  return db;
}

export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("[DB] MongoDB connection closed.");
  }
}
