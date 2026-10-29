import "server-only";
import { connectDB } from "@/lib/db/connect";
import { AuditLog } from "@/models/AuditLog";
import type { Actor } from "@/lib/actor";

export async function writeAudit(
  actor: Actor,
  entry: { action: string; entityType: string; entityId?: string; summary?: string; meta?: unknown },
) {
  await connectDB();
  await AuditLog.create({ actorId: actor.id ?? undefined, actorEmail: actor.email, ...entry });
}
