import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { sendAbandonedCartEmails } from "@/modules/cart/abandoned-cart";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Triggers the abandoned-cart reminder email sweep. Intended to be called
 * on a schedule by a scheduler such as Vercel Cron.
 *
 * Auth is via the `Authorization: Bearer <CRON_SECRET>` header ONLY. A
 * `?secret=` query-string fallback used to also be accepted, but query
 * strings routinely end up in server access logs, proxy logs, and browser
 * history - any of which could leak the secret. Vercel Cron (and any other
 * sane scheduler) sends the secret as a header, so there's no legitimate
 * caller that needs the query-string form.
 */
export async function GET(request: NextRequest) {
  const configuredSecret = process.env.CRON_SECRET;

  if (!configuredSecret) {
    return apiError("CRON_SECRET is not configured on the server.", [], 500);
  }

  const authHeader = request.headers.get("authorization");
  const providedSecret = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (providedSecret !== configuredSecret) {
    return apiError("Unauthorized", [], 401);
  }

  try {
    const result = await sendAbandonedCartEmails();
    return apiSuccess(result, `Sent ${result.emailed} abandoned cart reminder email(s).`);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to run abandoned cart sweep.",
      [],
      500
    );
  }
}
