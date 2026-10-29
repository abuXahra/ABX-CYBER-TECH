import "server-only";
import { createHash } from "node:crypto";
import { connectDB } from "@/lib/db/connect";
import { LoginAttempt } from "@/models/LoginAttempt";

const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;

export const throttleKey = (email: string, ip: string) =>
  createHash("sha256").update(`${email.toLowerCase()}|${ip}`).digest("hex");

export async function isLockedOut(key: string): Promise<boolean> {
  await connectDB();
  const row = await LoginAttempt.findOne({ key }).lean<{ lockedUntil?: Date }>();
  return !!row?.lockedUntil && row.lockedUntil.getTime() > Date.now();
}

export async function recordFailure(key: string): Promise<void> {
  await connectDB();
  const row = await LoginAttempt.findOneAndUpdate(
    { key },
    { $inc: { failures: 1 }, $set: { expiresAt: new Date(Date.now() + LOCK_MS * 2) } },
    { upsert: true, new: true },
  );
  if (row.failures >= MAX_FAILURES) {
    await LoginAttempt.updateOne({ key }, { $set: { lockedUntil: new Date(Date.now() + LOCK_MS), failures: 0 } });
  }
}

export async function clearFailures(key: string): Promise<void> {
  await connectDB();
  await LoginAttempt.deleteOne({ key });
}
