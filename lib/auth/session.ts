import { randomUUID } from "crypto";
import { UserModel } from "../models/User";

export async function createSentinelSession(userId: string) {
  const sessionId = randomUUID();

  const user = await UserModel.findOneAndUpdate(
    {
      _id: userId,
      role: "admin",
      status: "active",
    },
    {
      $set: {
        activeSessionId: sessionId,
      },
    },
    {
      new: true,
    },
  );

  if (!user) {
    throw new Error("Unable to create Sentinel session.");
  }

  return sessionId;
}

export async function invalidateSentinelSession(userId: string) {
  await UserModel.findOneAndUpdate(
    {
      _id: userId,
      role: "admin",
    },
    {
      $set: {
        activeSessionId: null,
      },
    },
  );
}