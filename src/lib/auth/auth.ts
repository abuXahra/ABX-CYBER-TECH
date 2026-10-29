import "server-only";
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { connectDB } from "@/lib/db/connect";
import { Admin } from "@/models/Admin";
import { verifyPassword } from "./password";
import { clearFailures, isLockedOut, recordFailure, throttleKey } from "./throttle";

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(1).max(128) });

// A valid-format Argon2id hash used to keep timing similar when the account doesn't exist.
const DUMMY_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHRzb21lc2FsdA$Z2VuZXJpY2R1bW15aGFzaGZvcnRpbWluZw";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw, request) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        const key = throttleKey(email, ip);

        if (await isLockedOut(key)) return null;
        await connectDB();
        const admin = await Admin.findOne({ email: email.toLowerCase(), active: true }).select("+passwordHash");
        const ok = await verifyPassword(admin?.passwordHash ?? DUMMY_HASH, password);
        if (!admin || !ok) {
          await recordFailure(key);
          return null;
        }
        await clearFailures(key);
        await Admin.updateOne({ _id: admin._id }, { $set: { lastLoginAt: new Date() } });
        return { id: String(admin._id), email: admin.email, name: admin.name };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
