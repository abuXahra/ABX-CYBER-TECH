import type { NextAuthConfig } from "next-auth";

/** Edge-safe half of the auth config (no database / native imports). Used by middleware. */
export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8-hour sessions
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      if (path.startsWith("/admin") && path !== "/admin/login") return !!auth?.user;
      return true;
    },
  },
} satisfies NextAuthConfig;
