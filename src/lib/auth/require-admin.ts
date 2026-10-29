import "server-only";
import { auth } from "./auth";
import { connectDB } from "@/lib/db/connect";
import { Admin } from "@/models/Admin";
import { AuthorizationError } from "@/lib/errors";

export type AdminIdentity = { id: string; email: string };

/**
 * Call at the top of EVERY admin server action, route handler and admin data loader.
 * Middleware is only a convenience redirect; this is the authoritative check, and it also
 * confirms the account still exists and is active (so disabling an admin takes effect at once).
 */
export async function requireAdmin(): Promise<AdminIdentity> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) throw new AuthorizationError();
  await connectDB();
  const admin = await Admin.findOne({ _id: id, active: true }).select("email").lean<{ email: string }>();
  if (!admin) throw new AuthorizationError();
  return { id, email: admin.email };
}
