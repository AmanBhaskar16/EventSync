
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  providers: [], // intentionally empty — Credentials needs Node.js runtime
  callbacks: {
    async jwt({ token, user, trigger, session: sessionData }) {
      if (user) {
        token.id     = user.id as string;
        token.role   = (user as { role: "CUSTOMER" | "VENDOR" | "ADMIN" }).role;
        token.avatar = (user as { image?: string | null }).image ?? null;
      }
      if (trigger === "update" && sessionData?.avatar !== undefined) {
        token.avatar = sessionData.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id     = token.id     as string;
        session.user.role   = token.role   as "CUSTOMER" | "VENDOR" | "ADMIN";
        session.user.avatar = token.avatar as string | null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;