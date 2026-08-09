import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { connectToDatabase, disconnectFromDatabase } from "@/lib/db";

let mongod: MongoMemoryServer | undefined;

/**
 * Starts an in-memory MongoDB instance and points connectToDatabase() at
 * it via MONGODB_URI. Call from beforeAll(); pair with stopTestDatabase()
 * in afterAll(). Each test file gets its own isolated instance/database.
 */
export async function startTestDatabase(): Promise<void> {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  await connectToDatabase();
}

export async function stopTestDatabase(): Promise<void> {
  await disconnectFromDatabase();
  await mongod?.stop();
  mongod = undefined;
}

/** Drops all collections between tests, without tearing down the connection. */
export async function clearTestDatabase(): Promise<void> {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
}
