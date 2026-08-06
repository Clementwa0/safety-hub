
const SANDBOX_BASE_URL = "https://sandbox.safaricom.co.ke";
const PRODUCTION_BASE_URL = "https://api.safaricom.co.ke";

export class MpesaError extends Error {
  constructor(
    message: string,
    public readonly status = 502,
  ) {
    super(message);
    this.name = "MpesaError";
  }
}

function getBaseUrl(): string {
  return process.env.MPESA_ENV === "production" ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL;
}

function getConfig() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL || buildDefaultCallbackUrl();

  if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
    throw new MpesaError(
      "M-Pesa is not configured. Set MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE and MPESA_PASSKEY.",
      500,
    );
  }

  if (!callbackUrl) {
    throw new MpesaError(
      "M-Pesa callback URL could not be determined. Set MPESA_CALLBACK_URL or NEXT_PUBLIC_APP_URL.",
      500,
    );
  }

  return { consumerKey, consumerSecret, shortcode, passkey, callbackUrl };
}

function buildDefaultCallbackUrl(): string | undefined {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  if (!appUrl) return undefined;
  return `${appUrl.replace(/\/$/, "")}/api/mpesa/callback`;
}
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const { consumerKey, consumerSecret } = getConfig();

  if (cachedToken && cachedToken.expiresAt > Date.now() + 5000) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const response = await fetch(`${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    method: "GET",
    headers: { Authorization: `Basic ${credentials}` },
  });

  if (!response.ok) {
    throw new MpesaError("Could not authenticate with M-Pesa. Please try again shortly.", 502);
  }

  const data = (await response.json()) as { access_token?: string; expires_in?: string };

  if (!data.access_token) {
    throw new MpesaError("M-Pesa did not return an access token.", 502);
  }

  const expiresInMs = (Number(data.expires_in) || 3599) * 1000;
  cachedToken = { token: data.access_token, expiresAt: Date.now() + expiresInMs };

  return data.access_token;
}

function buildTimestamp(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
}

function buildPassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

/**
 * Normalizes a Kenyan phone number to the 2547XXXXXXXX / 2541XXXXXXXX
 * format Daraja requires. Returns null if the input can't be normalized to
 * a plausible Kenyan MSISDN.
 */
export function normalizeMpesaPhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;

  let normalized: string;
  if (digits.startsWith("254") && digits.length === 12) {
    normalized = digits;
  } else if (digits.startsWith("0") && digits.length === 10) {
    normalized = `254${digits.slice(1)}`;
  } else if ((digits.startsWith("7") || digits.startsWith("1")) && digits.length === 9) {
    normalized = `254${digits}`;
  } else {
    return null;
  }

  return /^254(7|1)\d{8}$/.test(normalized) ? normalized : null;
}

export interface StkPushRequest {
  /** Kenyan phone number, any reasonable format — will be normalized. */
  phone: string;
  /** Amount in KES. Daraja only accepts whole numbers. */
  amount: number;
  /** Shows up on the customer's STK prompt and in the Daraja transaction log. */
  accountReference: string;
  transactionDesc: string;
}

export interface StkPushResult {
  merchantRequestId: string;
  checkoutRequestId: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
}

export async function initiateStkPush(request: StkPushRequest): Promise<StkPushResult> {
  const { shortcode, passkey, callbackUrl } = getConfig();

  const phone = normalizeMpesaPhone(request.phone);
  if (!phone) {
    throw new MpesaError("Enter a valid Safaricom M-Pesa number (e.g. 07XX XXX XXX).", 400);
  }

  const amount = Math.round(request.amount);
  if (amount <= 0) {
    throw new MpesaError("Invalid payment amount.", 400);
  }

  const token = await getAccessToken();
  const timestamp = buildTimestamp();
  const password = buildPassword(shortcode, passkey, timestamp);

  const response = await fetch(`${getBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: request.accountReference.slice(0, 12),
      TransactionDesc: request.transactionDesc.slice(0, 13),
    }),
  });

  const data = (await response.json().catch(() => null)) as
    | {
        MerchantRequestID?: string;
        CheckoutRequestID?: string;
        ResponseCode?: string;
        ResponseDescription?: string;
        CustomerMessage?: string;
        errorMessage?: string;
      }
    | null;

  if (!response.ok || !data || data.ResponseCode !== "0" || !data.CheckoutRequestID) {
    throw new MpesaError(
      data?.errorMessage || data?.ResponseDescription || "M-Pesa declined the payment request. Please try again.",
      502,
    );
  }

  return {
    merchantRequestId: data.MerchantRequestID ?? "",
    checkoutRequestId: data.CheckoutRequestID,
    responseCode: data.ResponseCode,
    responseDescription: data.ResponseDescription ?? "",
    customerMessage: data.CustomerMessage ?? "Check your phone to complete the payment.",
  };
}

export type StkQueryStatus = "pending" | "paid" | "failed" | "cancelled";

export interface StkQueryResult {
  status: StkQueryStatus;
  resultCode?: string;
  resultDesc?: string;
}

/**
 * Actively asks Safaricom for the outcome of a previously-initiated STK
 * push. Used as a fallback for when the async callback hasn't arrived yet
 * (e.g. local development without a public callback URL, or a slow
 * network) — the status endpoint calls this if the order is still
 * "pending" a few seconds after the push was sent.
 */
export async function queryStkPushStatus(checkoutRequestId: string): Promise<StkQueryResult> {
  const { shortcode, passkey } = getConfig();
  const token = await getAccessToken();
  const timestamp = buildTimestamp();
  const password = buildPassword(shortcode, passkey, timestamp);

  const response = await fetch(`${getBaseUrl()}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }),
  });

  const data = (await response.json().catch(() => null)) as
    | { ResultCode?: string; ResultDesc?: string; errorCode?: string; errorMessage?: string }
    | null;

  if (!response.ok || !data) {
    return { status: "pending" };
  }

  // Safaricom returns errorCode "500.001.1001" (paraphrased) while the
  // transaction is still awaiting the customer's PIN entry — treat any
  // error response here as "still pending" rather than a hard failure.
  if (data.errorCode) {
    return { status: "pending" };
  }

  if (data.ResultCode === "0") {
    return { status: "paid", resultCode: data.ResultCode, resultDesc: data.ResultDesc };
  }

  if (data.ResultCode === "1032") {
    // Request cancelled by the user on their phone.
    return { status: "cancelled", resultCode: data.ResultCode, resultDesc: data.ResultDesc };
  }

  if (data.ResultCode) {
    return { status: "failed", resultCode: data.ResultCode, resultDesc: data.ResultDesc };
  }

  return { status: "pending" };
}
