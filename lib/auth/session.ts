import { randomUUID } from "crypto";
import { StorefrontCustomerModel } from "../models/StorefrontCustomer";

/**
 * Starts a new single-session-enforced session for a staff/admin account:
 * generates a fresh session id, persists it as the ONLY currently-valid
 * session for that account, and returns it so the caller (the `jwt`
 * callback in ./config.ts) can embed it in the token as `sid`.
 *
 * Because this overwrites `activeSessionId` unconditionally, any token
 * issued for a previous session — on this device or any other — stops
 * passing the check in the `jwt` callback the moment this runs. That's
 * what keeps a Sentinel account down to one active session at a time:
 * logging in somewhere new silently signs the account out everywhere else.
 *
 * Deliberately NOT called for ordinary customer sign-ins — customers are
 * still allowed concurrent sessions across devices, same as before.
 */
export async function createSession(userId: string) {
  const sessionId = randomUUID();
  await StorefrontCustomerModel.findByIdAndUpdate(userId, { activeSessionId: sessionId });
  return sessionId;
}

/**
 * Ends whatever session is currently active for a staff/admin account, so
 * its token can no longer be used even before it expires. Call this on
 * Sentinel logout.
 */
export async function invalidateSession(userId: string) {
  await StorefrontCustomerModel.findByIdAndUpdate(userId, { activeSessionId: null });
}
