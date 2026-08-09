import type { JWT } from "next-auth/jwt";
import type { AdapterSession } from "next-auth/adapters";
import { connectToDatabase } from "@/lib/db";
import { invalidateSession } from "@/lib/auth/session";

/**
 * The Auth.js `signOut` event handler for the single unified config
 * (registered in ./config.ts). Split into its own file — rather than
 * inlined into the `events` object there — for two reasons: it can be
 * unit tested directly without driving a full NextAuth sign-out flow, and
 * importing it doesn't pull in config.ts's module-level side effects
 * (`@auth/mongodb-adapter` + `lib/db/client.ts` eagerly open a real
 * MongoClient connection at import time).
 *
 * With `session: { strategy: "jwt" }` (required in config.ts — see the
 * note there), this event's message shape is `{ token }`, not
 * `{ session }` (that variant only fires for database-strategy sessions,
 * which this config never uses). `invalidateSession` exists specifically
 * so a signed-out Sentinel JWT can't keep working until its natural
 * expiry if it's copied/stolen afterward — see the `jwt` callback in
 * config.ts's `token.sid !== dbUser.activeSessionId` check. This is the
 * one place that guarantee actually gets enforced; without it,
 * `invalidateSession` was dead code and sign-out only ever cleared the
 * browser's cookie.
 *
 * Skipped for ordinary customers (no `sid`/single-session enforcement for
 * them to begin with — see createSession's header comment) so a customer
 * sign-out isn't paying for a DB write that does nothing.
 */
export async function handleSentinelSignOut(
  message: { session: void | AdapterSession | null | undefined } | { token: JWT | null },
) {
  const token = "token" in message ? message.token : null;

  if (!token?.id || (token.role !== "staff" && token.role !== "admin")) return;

  try {
    await connectToDatabase();
    await invalidateSession(token.id);
  } catch (error) {
    console.error("Failed to invalidate Sentinel session on sign-out:", error);
  }
}
