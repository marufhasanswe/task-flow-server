import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not defined in .env");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("task-flow");
    const tasks = db.collection("tasks");

    // app.get("/tasks", async (req, res) => {
    //   const tasks = await tasks.find({}).toArray();
    //   res.json(tasks);
    // });

    app.post("/api/tasks", async (req, res) => {
      const task = req.body;
      const result = await tasks.insertOne(task);
      res.json(result);
    });

    await client.db("admin").command({ ping: 1 });

    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error(error);
  }
}

run();

app.get("/", (req, res) => {
  res.send("Hello TypeScript");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
