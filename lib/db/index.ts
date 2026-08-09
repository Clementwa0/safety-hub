// Barrel so existing `@/lib/db` imports (connectToDatabase,
// disconnectFromDatabase) keep resolving unchanged after the Mongoose
// connection logic moved into this folder as mongodb.ts. The native
// MongoClient promise used by the Auth.js MongoDB adapter lives alongside
// it in ./client.ts (imported directly as `@/lib/db/client`, not
// re-exported here, since it's a single default export for one consumer).
export * from "./mongodb";
