// Barrel for the app's single Auth.js instance — the NextAuth config
// itself lives in ./config.ts (kept separate so ./permissions.ts can
// import `auth` from it without a circular import through this barrel).
// Password hashing/serialization helpers live in ./sentinel.ts, staff
// single-session enforcement in ./session.ts, and role-gating helpers in
// ./permissions.ts. Re-exported together here so the many existing
// `@/lib/auth` imports across the app keep working unchanged.
export * from "./config";
export * from "./sentinel";
export * from "./session";
export * from "./sign-out";
export * from "./permissions";
