import { MongoClient } from "mongodb";

/**
 * Auth.js's official MongoDB adapter (`@auth/mongodb-adapter`) talks to
 * MongoDB via the native driver's `MongoClient`, not Mongoose. Every other
 * part of this app uses Mongoose (`lib/db.ts`), which manages its own
 * connection lifecycle — the two clients are independent but point at the
 * same `MONGODB_URI`/database, so no new env var is required.
 *
 * This mirrors the official Next.js/Auth.js pattern: cache the client (and
 * the connection promise) on the Node global object in development so hot
 * reloads don't open a new connection on every file save, and use a plain
 * module-level singleton in production.
 */

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not defined. Please add MONGODB_URI to your .env file.",
    );
  }

  return uri;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(getMongoUri());
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(getMongoUri());
  clientPromise = client.connect();
}

export default clientPromise;
