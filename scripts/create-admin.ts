import { hashPassword } from "../lib/auth/sentinel";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/lib/models/User";
import "dotenv/config";
import mongoose from "mongoose";


function readArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

async function main() {
  const name = readArg("--name")?.trim();
  const email = readArg("--email")?.trim().toLowerCase();
  const password = readArg("--password");

  if (!name || !email || !password) {
    console.error(
      'Usage: npx tsx scripts/admin/create-admin.ts --name "Jane Doe" --email jane@example.com --password "your-password"',
    );

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
    const existingAdmin = await UserModel.findOne({
      role: "admin",
    })
      .select("_id email")
      .lean();

    if (existingAdmin) {
      console.error(
        `Refusing to create another Sentinel admin. Existing admin: ${existingAdmin.email}`,
      );

      process.exitCode = 1;
      return;
    }

    const existingUser = await UserModel.findOne({
      email,
    })
      .select("_id email role")
      .lean();

    if (existingUser) {
      console.error(
        `An account with email "${email}" already exists with role "${existingUser.role}".`,
      );

      process.exitCode = 1;
      return;
    }

    const passwordHash = await hashPassword(password);

    const admin = await UserModel.create({
      name,
      email,
      passwordHash,
      role: "admin",
      status: "active",
      activeSessionId: null,
    });

    console.log(
      `Created Sentinel admin "${admin.name}" <${admin.email}>.`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("create-admin failed:", error);
  process.exitCode = 1;
});