    // import path from "node:path";
    // import dotenv from "dotenv";
import mongoose from "mongoose";

// dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function getMongoDBUri(): string {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not defined. Please add MONGODB_URI to your .env file.",
    );
  }

  return uri;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache =
  global.mongooseCache ??
  (global.mongooseCache = {
    conn: null,
    promise: null,
  });

export async function connectToDatabase(): Promise<
  typeof mongoose
> {
  // Already connected
  if (cached.conn) {
    return cached.conn;
  }

  // Get a guaranteed string
  const uri = getMongoDBUri();

  // Create connection promise
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri);
  }

  try {
    cached.conn = await cached.promise;

    console.log(
      `MongoDB connected successfully: ${cached.conn.connection.host}/${cached.conn.connection.name}`,
    );

    return cached.conn;
  } catch (error) {
    // Allow retry after failure
    cached.promise = null;

    console.error("MongoDB connection failed:", error);

    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  if (!cached.conn) {
    return;
  }

  try {
    await mongoose.disconnect();

    cached.conn = null;
    cached.promise = null;

    console.log("MongoDB disconnected successfully");
  } catch (error) {
    console.error("MongoDB disconnect failed:", error);

    throw error;
  }
}