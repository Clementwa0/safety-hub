import path from "node:path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserModel } from "./models/User";

const envPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", ".env");
dotenv.config({ path: envPath });

async function seed() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured. Check the .env file at the project root.");
  }

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB_NAME || "safety-hub",
  });

  const exists = await UserModel.findOne({
    email: "admin@example.com",
  });

  if (exists) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const password = await bcrypt.hash("Admin@123", 12);

  await UserModel.create({
    name: "System Administrator",
    email: "admin@example.com",
    password,
    role: "admin",
  });

  console.log("Admin created!");
  process.exit(0);
}

seed().catch(console.error);