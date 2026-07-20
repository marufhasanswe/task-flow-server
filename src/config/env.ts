import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || "",
};

if (!env.MONGODB_URI) {
  console.error("❌ Critical: MONGODB_URI is not defined in environment variables!");
  process.exit(1);
}
