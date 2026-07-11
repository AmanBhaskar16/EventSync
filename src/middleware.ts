
// Runs on every request before the page renders.
// Responsibilities:
//   1. Redirect logged-in users away from /login, /register
//   2. Redirect unauthenticated users away from protected routes
//   3. RBAC — prevent a VENDOR from accessing /customer/* etc.

import NextAuth      from "next-auth";
import { authConfig } from "@/lib/auth/config";  // ← edge-safe, no Prisma
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const PROTECTED = ["/customer", "/vendor", "/admin"];
const GUEST_ONLY = ["/login", "/register", "/forgot-password"];
const ROLE_HOME: Record<string, string> = {
  CUSTOMER: "/customer/dashboard",
  VENDOR:   "/vendor/dashboard",
  ADMIN:    "/admin/dashboard",
};

export default auth(function middleware(req) {
  const { pathname } = req.nextUrl;
  const session    = req.auth;
  const isLoggedIn = !!session?.user;
  const role       = session?.user?.role as string | undefined;

  if (isLoggedIn && GUEST_ONLY.some((p) => pathname.startsWith(p))) {
    const home = (role && ROLE_HOME[role]) ?? "/";
    return NextResponse.redirect(new URL(home, req.url));
  }

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isProtected) {
    const segment = pathname.split("/")[1];
    const roleMap: Record<string, string> = {
      customer: "CUSTOMER",
      vendor:   "VENDOR",
      admin:    "ADMIN",
    };
    const required = roleMap[segment];
    if (required && role !== required) {
      const home = (role && ROLE_HOME[role]) ?? "/";
      return NextResponse.redirect(new URL(home, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};