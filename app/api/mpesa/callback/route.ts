import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { applyMpesaCallback, type DarajaCallbackPayload } from "@/lib/storefront/mpesa-payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Safaricom posts here once the customer has responded to the STK push (or
 * it times out/gets cancelled). This is a server-to-server webhook — there
 * is no customer session on the request, so the order is looked up by the
 * CheckoutRequestID Safaricom echoes back (see `applyMpesaCallback`).
 *
 * Per the Daraja spec, this must always respond 200 with
 * `{ ResultCode: 0, ResultDesc: "success" }` to acknowledge receipt —
 * that's unrelated to whether the *payment* succeeded (that's in the
 * payload body) and just tells Safaricom not to retry the callback.
 */
export async function POST(request: Request) {
  const ack = NextResponse.json({ ResultCode: 0, ResultDesc: "success" });

  try {
    const payload = (await request.json().catch(() => null)) as DarajaCallbackPayload | null;
    if (!payload) return ack;

    await connectToDatabase();
    await applyMpesaCallback(payload);
  } catch (error) {
    // Never fail this response — Safaricom will just retry the callback,
    // and we've already logged the problem for follow-up.
    console.error("[mpesa/callback] Failed to process callback:", error);
  }

  return ack;
}
