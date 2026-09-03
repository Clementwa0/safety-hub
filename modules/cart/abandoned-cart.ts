import mongoose from "mongoose";
import nodemailer from "nodemailer";

import { connectToDatabase } from "@/lib/db";
import { CartModel } from "@/lib/models/Cart";
import { ProductModel, type IProductVariant } from "@/lib/models/Product";
import { UserModel as StorefrontCustomerModel } from "@/lib/models/User";
import { formatKES } from "@/lib/format";

const DEFAULT_THRESHOLD_HOURS = 24;
const BATCH_LIMIT = 30; // Prevents function timeout by capping per run
const CHUNK_SIZE = 5;    // Number of emails to send concurrently

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

  if (!authEmailFrom || !authEmailHost || !authEmailUser || !authEmailPassword) {
    result.errors.push(
      "Email configuration is incomplete (AUTH_EMAIL_SERVER_* / AUTH_EMAIL_FROM)."
    );
    return result;
  }

  await connectToDatabase();

  const cutoff = new Date(Date.now() - getThresholdHours() * 60 * 60 * 1000);

  // Added .limit(BATCH_LIMIT) to ensure we don't exceed Vercel max execution time
  const staleCarts = await CartModel.find({
    user: { $exists: true },
    "items.0": { $exists: true },
    updatedAt: { $lte: cutoff },
    $expr: {
      $or: [
        { $eq: ["$abandonedEmailSentAt", null] },
        { $lt: ["$abandonedEmailSentAt", "$updatedAt"] },
      ],
    },
  })
    .limit(BATCH_LIMIT);

  result.scanned = staleCarts.length;

  if (staleCarts.length === 0) {
    return result;
  }

  // Reuse TCP connections with SMTP Pooling
  const transporter = nodemailer.createTransport({
    host: authEmailHost,
    port: authEmailPort,
    secure: authEmailPort === 465,
    pool: true,
    maxConnections: 5,
    auth: {
      user: authEmailUser,
      pass: authEmailPassword,
    },
  });

  const productIds = [
    ...new Set(
      staleCarts.flatMap((cart) => cart.items.map((item) => String(item.product)))
    ),
  ].map((id) => new mongoose.Types.ObjectId(id));

  const products = await ProductModel.find({ _id: { $in: productIds } }).lean();

  const productMap = new Map(
    products.map((product) => [String(product._id), product])
  );

  const customerIds = [
    ...new Set(
      staleCarts
        .map((cart) => cart.user)
        .filter((id): id is mongoose.Types.ObjectId => id !== undefined && id !== null)
        .map((id) => String(id))
    ),
  ].map((id) => new mongoose.Types.ObjectId(id));

  // Post-unification, `Cart.user` can point at a staff/admin account too
  // (there's only one identity model). Restrict to role: "customer" here
  // so staff/admin carts are never sent this marketing email - a cart
  // whose owner isn't in this map falls through the existing
  // `!customer?.email` skip below, same as it always did.
  const customers = await StorefrontCustomerModel.find({
    _id: { $in: customerIds },
    role: "customer",
  }).lean();

  const customerMap = new Map(
    customers.map((customer) => [String(customer._id), customer])
  );

  const cartLink = appUrl ? `${appUrl.replace(/\/$/, "")}/cart` : "/cart";

  // Helper function to process an individual cart
  async function processCart(cart: typeof staleCarts[number]) {
    const customer = cart.user ? customerMap.get(String(cart.user)) : undefined;

    if (!customer?.email) {
      result.skipped++;
      return;
    }

    const lines = cart.items
      .map((item) => {
        const product = productMap.get(String(item.product));
        if (!product) return null;

        // Mirror serializeCart/checkout: a cart line with a variantSku
        // prices and labels off that variant, not the parent product,
        // so the reminder email doesn't quote a stale rolled-up price.
        const variant = item.variantSku
          ? product.variants?.find(
              (v: IProductVariant) => v.sku === item.variantSku,
            )
          : undefined;

        return {
          name: variant ? `${product.name} (${variant.size})` : product.name,
          quantity: item.quantity,
          lineTotal: (variant ? variant.price : product.price) * item.quantity,
        };
      })
      .filter(
        (line): line is { name: string; quantity: number; lineTotal: number } =>
          line !== null
      );

    if (lines.length === 0) {
      result.skipped++;
      return;
    }

    const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const greetingName = customer.name ? customer.name.split(" ")[0] : "there";

    const textLines = lines.map(
      (line) => `• ${line.name} ×${line.quantity} - ${formatKES(line.lineTotal)}`
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
                    `<li>${line.name} ×${line.quantity} - ${formatKES(
                      line.lineTotal
                    )}</li>`
                )
                .join("")}
            </ul>
            <p><strong>Total: ${formatKES(total)}</strong></p>
            <p>
              <a
                href="${cartLink}"
                style="display:inline-block;padding:12px 20px;background:#0f172a;color:#fff;text-decoration:none;border-radius:6px;"
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
      const message = error instanceof Error ? error.message : "Unknown error";
      result.errors.push(`Cart ${String(cart._id)}: ${message}`);
    }
  }

  // Execute in concurrent chunks of size CHUNK_SIZE
  for (let i = 0; i < staleCarts.length; i += CHUNK_SIZE) {
    const chunk = staleCarts.slice(i, i + CHUNK_SIZE);
    await Promise.all(chunk.map((cart) => processCart(cart)));
  }

  transporter.close();
  return result;
    }
