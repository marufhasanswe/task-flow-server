import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { connectToDatabase } from "./database/connection.js";
import taskRouter from "./routes/task.routes.js";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/tasks", taskRouter);

app.get("/", (req, res) => {
  res.send("Hello TypeScript");
});

// Fallback middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// Bootstrap
async function startServer() {
  try {
    // Establish connection to MongoDB
    await connectToDatabase();

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start the server:", error);
    process.exit(1);
  }
}

startServer();
