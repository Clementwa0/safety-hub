import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { sendAbandonedCartEmails } from "@/lib/storefront/abandoned-cart";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Triggers the abandoned-cart reminder email sweep. Intended to be called
 * on a schedule (e.g. hourly) by a scheduler such as Vercel Cron — not by
 * the storefront itself.
 *
 * Protected by `CRON_SECRET`: the caller must send it either as
 * `Authorization: Bearer <secret>` (what Vercel Cron sends automatically
 * when `CRON_SECRET` is set in the project) or as a `?secret=` query param
 * for schedulers that can't set headers. If `CRON_SECRET` isn't configured,
 * the route refuses to run rather than sending unauthenticated bulk email.
 */
export async function GET(request: NextRequest) {
  const configuredSecret = process.env.CRON_SECRET;

  if (!configuredSecret) {
    return apiError("CRON_SECRET is not configured on the server.", [], 500);
  }

  const authHeader = request.headers.get("authorization");
  const headerSecret = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const querySecret = request.nextUrl.searchParams.get("secret");
  const providedSecret = headerSecret || querySecret;

  if (providedSecret !== configuredSecret) {
    return apiError("Unauthorized", [], 401);
  }

  try {
    const result = await sendAbandonedCartEmails();
    return apiSuccess(result, `Sent ${result.emailed} abandoned cart reminder email(s).`);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to run abandoned cart sweep.", [], 500);
  }
}
