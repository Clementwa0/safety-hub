import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { sendAbandonedCartEmails } from "@/lib/storefront/abandoned-cart";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Extend Vercel function timeout limit (60s for Hobby, up to 300s/800s for Pro)
export const maxDuration = 60;

/**
 * Triggers the abandoned-cart reminder email sweep. Intended to be called
 * on a schedule (e.g. hourly) by a scheduler such as Vercel Cron — not by
 * the storefront itself.
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
}    return apiSuccess(result, `Sent ${result.emailed} abandoned cart reminder email(s).`);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to run abandoned cart sweep.", [], 500);
  }
}
