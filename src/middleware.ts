import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

// Convenience redirect only. Every admin operation re-checks via requireAdmin().
export default NextAuth(authConfig).auth;

export const config = { matcher: ["/admin/:path*"] };
