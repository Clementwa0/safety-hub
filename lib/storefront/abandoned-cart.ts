import mongoose from "mongoose";
import nodemailer from "nodemailer";

import { connectToDatabase } from "@/lib/db";
import { CartModel } from "@/lib/models/Cart";
import { ProductModel } from "@/lib/models/Product";
import { StorefrontCustomerModel } from "@/lib/models/StorefrontCustomer";
import { formatKES } from "@/lib/format";

const DEFAULT_THRESHOLD_HOURS = 2;

const CUSTOMER_MODEL = "StorefrontCustomer";

function getThresholdHours(): number {
  const raw = Number(process.env.ABANDONED_CART_THRESHOLD_HOURS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_THRESHOLD_HOURS;
}

function getEnv() {
  return {
    authEmailFrom: process.env.AUTH_EMAIL_FROM,
    authEmailHost: process.env.AUTH_EMAIL_SERVER_HOST,
    authEmailPort: Number(process.env.AUTH_EMAIL_SERVER_PORT || 587),
    authEmailUser: process.env.AUTH_EMAIL_SERVER_USER,
    authEmailPassword: process.env.AUTH_EMAIL_SERVER_PASSWORD,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL,
  };
}

export interface AbandonedCartRunResult {
  scanned: number;
  emailed: number;
  skipped: number;
  failed: number;
  errors: string[];
}

export async function sendAbandonedCartEmails(): Promise<AbandonedCartRunResult> {
  const result: AbandonedCartRunResult = {
    scanned: 0,
    emailed: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  const {
    authEmailFrom,
    authEmailHost,
    authEmailPort,
    authEmailUser,
    authEmailPassword,
    appUrl,
  } = getEnv();

  if (
    !authEmailFrom ||
    !authEmailHost ||
    !authEmailUser ||
    !authEmailPassword
  ) {
    result.errors.push(
      "Email configuration is incomplete (AUTH_EMAIL_SERVER_* / AUTH_EMAIL_FROM).",
    );
    return result;
  }

  await connectToDatabase();

  const cutoff = new Date(
    Date.now() - getThresholdHours() * 60 * 60 * 1000,
  );

  const staleCarts = await CartModel.find({
    userModel: CUSTOMER_MODEL,
    user: { $exists: true },
    "items.0": { $exists: true },
    updatedAt: { $lte: cutoff },
    $expr: {
      $or: [
        { $eq: ["$abandonedEmailSentAt", null] },
        { $lt: ["$abandonedEmailSentAt", "$updatedAt"] },
      ],
    },
  });

  result.scanned = staleCarts.length;

  if (staleCarts.length === 0) {
    return result;
  }

  const transporter = nodemailer.createTransport({
    host: authEmailHost,
    port: authEmailPort,
    secure: authEmailPort === 465,
    auth: {
      user: authEmailUser,
      pass: authEmailPassword,
    },
  });

  // Collect unique product ids
  const productIds: mongoose.Types.ObjectId[] = [
    ...new Set(
      staleCarts.flatMap((cart) =>
        cart.items.map((item) => String(item.product)),
      ),
    ),
  ].map((id) => new mongoose.Types.ObjectId(id));

  const products = await ProductModel.find({
    _id: { $in: productIds },
  });

  const productMap = new Map(
    products.map((product) => [String(product._id), product]),
  );

  // Collect unique customer ids (TYPE SAFE)
  const customerIds: mongoose.Types.ObjectId[] = [
    ...new Set(
      staleCarts
        .map((cart) => cart.user)
        .filter(
          (id): id is mongoose.Types.ObjectId =>
            id !== undefined && id !== null,
        )
        .map((id) => String(id)),
    ),
  ].map((id) => new mongoose.Types.ObjectId(id));

  const customers = await StorefrontCustomerModel.find({
    _id: {
      $in: customerIds,
    },
  });

  const customerMap = new Map(
    customers.map((customer) => [String(customer._id), customer]),
  );

  const cartLink = appUrl
    ? `${appUrl.replace(/\/$/, "")}/cart`
    : "/cart";

  for (const cart of staleCarts) {
    const customer = cart.user
      ? customerMap.get(String(cart.user))
      : undefined;

    if (!customer?.email) {
      result.skipped++;
      continue;
    }

    const lines = cart.items
      .map((item) => {
        const product = productMap.get(String(item.product));

        if (!product) return null;

        return {
          name: product.name,
          quantity: item.quantity,
          lineTotal: product.price * item.quantity,
        };
      })
      .filter(
        (
          line,
        ): line is {
          name: string;
          quantity: number;
          lineTotal: number;
        } => line !== null,
      );

    if (lines.length === 0) {
      result.skipped++;
      continue;
    }

    const total = lines.reduce(
      (sum, line) => sum + line.lineTotal,
      0,
    );

    const greetingName = customer.name
      ? customer.name.split(" ")[0]
      : "there";

    const textLines = lines.map(
      (line) =>
        `• ${line.name} ×${line.quantity} — ${formatKES(
          line.lineTotal,
        )}`,
    );

    try {
      await transporter.sendMail({
        from: authEmailFrom,
        to: customer.email,
        subject: "You left something in your cart",
        text: [
          `Hi ${greetingName},`,
          "",
          "You still have items waiting in your Safety Hub cart:",
          "",
          ...textLines,
          "",
          `Total: ${formatKES(total)}`,
          "",
          `Pick up where you left off: ${cartLink}`,
        ].join("\n"),
        html: `
          <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;">
            <p>Hi ${greetingName},</p>

            <p>You still have items waiting in your Safety Hub cart:</p>

            <ul>
              ${lines
                .map(
                  (line) =>
                    `<li>${line.name} ×${line.quantity} — ${formatKES(
                      line.lineTotal,
                    )}</li>`,
                )
                .join("")}
            </ul>

            <p>
              <strong>Total: ${formatKES(total)}</strong>
            </p>

            <p>
              <a
                href="${cartLink}"
                style="
                  display:inline-block;
                  padding:12px 20px;
                  background:#0f172a;
                  color:#fff;
                  text-decoration:none;
                  border-radius:6px;
                "
              >
                Return to your cart
              </a>
            </p>
          </div>
        `,
      });

      cart.abandonedEmailSentAt = new Date();
      await cart.save();

      result.emailed++;
    } catch (error) {
      result.failed++;

      const message =
        error instanceof Error
          ? error.message
          : "Unknown error";

      result.errors.push(
        `Cart ${String(cart._id)}: ${message}`,
      );

      console.error(
        "[abandoned-cart] Failed to send reminder email:",
        error,
      );
    }
  }

  return result;
}