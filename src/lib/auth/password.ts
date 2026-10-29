import "server-only";
import { hash, verify } from "@node-rs/argon2";
import { z } from "zod";

export const passwordSchema = z.string().min(12, "Use at least 12 characters").max(128);

// @node-rs/argon2 defaults to Argon2id. Parameters follow OWASP guidance (19 MiB, t=2, p=1).
const OPTIONS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 };

export const hashPassword = (plain: string) => hash(passwordSchema.parse(plain), OPTIONS);

export async function verifyPassword(passwordHash: string, plain: string): Promise<boolean> {
  try {
    return await verify(passwordHash, plain);
  } catch {
    return false;
  }
}
