
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  providers: [], // intentionally empty — Credentials needs Node.js runtime
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id as string;
        token.role = (user as { role: "CUSTOMER" | "VENDOR" | "ADMIN" }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id   = token.id   as string;
        session.user.role = token.role as "CUSTOMER" | "VENDOR" | "ADMIN";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;