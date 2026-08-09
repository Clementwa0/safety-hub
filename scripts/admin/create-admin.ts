/**
 * Creates the single Sentinel admin account from the command line.
 *
 * WHY THIS EXISTS
 * ----------------
 * `/api/auth/register` (see app/api/auth/register/route.ts) always
 * requires an authenticated admin — there is no anonymous path, including
 * for the very first admin. This script is that first-admin path: it
 * writes directly to the database, for scripted/CI provisioning or for
 * recovering access if the admin account is ever lost.
 *
 * Sentinel only ever allows one admin account (enforced at the model
 * layer in lib/models/StorefrontCustomer.ts), so this script will refuse
 * to run if an admin already exists.
 *
 * USAGE
 * -----
 *   npx tsx scripts/admin/create-admin.ts --name "Jane Doe" --email jane@example.com --password "at-least-6-chars"
 *
 * All three flags are required. Exits non-zero (and creates nothing) if
 * an admin account already exists, or if an account with that email
 * already exists.
 */
import "dotenv/config";
import mongoose from "mongoose";

import { connectToDatabase } from "../../lib/db";
import { StorefrontCustomerModel } from "../../lib/models/StorefrontCustomer";
import { hashPassword } from "../../lib/auth";

function readArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index !== -1 ? process.argv[index + 1] : undefined;
}

async function main() {
  const name = readArg("--name");
  const email = readArg("--email")?.trim().toLowerCase();
  const password = readArg("--password");

  if (!name || !email || !password) {
    console.error("Usage: npx tsx scripts/admin/create-admin.ts --name \"Jane Doe\" --email jane@example.com --password \"at-least-6-chars\"");
    process.exitCode = 1;
    return;
  }

  if (password.length < 6) {
    console.error("Password must be at least 6 characters.");
    process.exitCode = 1;
    return;
  }

  await connectToDatabase();

  try {
    const existingAdmin = await StorefrontCustomerModel.findOne({ role: "admin" }).lean();
    if (existingAdmin) {
      console.error(`Refusing to create a second admin account — "${existingAdmin.email}" is already the Sentinel admin.`);
      process.exitCode = 1;
      return;
    }

    const existingEmail = await StorefrontCustomerModel.findOne({ email }).lean();
    if (existingEmail) {
      console.error(`An account with email "${email}" already exists.`);
      process.exitCode = 1;
      return;
    }

    const passwordHash = await hashPassword(password);
    const admin = await StorefrontCustomerModel.create({
      name,
      email,
      passwordHash,
      role: "admin",
      status: "active",
    });

    console.log(`Created Sentinel admin "${admin.name}" <${admin.email}>.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("create-admin failed:", error);
  process.exitCode = 1;
});
