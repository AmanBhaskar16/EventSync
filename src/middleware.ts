// // src/middleware.ts
// //
// // Runs on every request before the page renders.
// // Responsibilities:
// //   1. Redirect logged-in users away from /login, /register
// //   2. Redirect unauthenticated users away from protected routes
// //   3. RBAC — prevent a VENDOR from accessing /customer/* etc.

// import { NextResponse }  from "next/server";
// import type { NextRequest } from "next/server";

// // Routes that require authentication
// const PROTECTED = ["/customer", "/vendor", "/admin"];

// // Routes only for guests (redirect away if logged in)
// const GUEST_ONLY = ["/login", "/register", "/forgot-password"];

// // Where each role lands after login
// const ROLE_HOME: Record<string, string> = {
//   CUSTOMER: "/customer/dashboard",
//   VENDOR:   "/vendor/dashboard",
//   ADMIN:    "/admin/dashboard",
// };

// export default function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   // NextAuth v5 attaches session to req.auth
//   const session    = (req as NextRequest & { auth: Record<string, unknown> | null }).auth;
//   const isLoggedIn = !!session?.user;
//   const role       = (session?.user as Record<string, string> | undefined)?.role;

//   // ── 1. Logged-in user hits /login or /register → send to dashboard ──
//   if (isLoggedIn && GUEST_ONLY.some((p) => pathname.startsWith(p))) {
//     const home = (role && ROLE_HOME[role]) ?? "/";
//     return NextResponse.redirect(new URL(home, req.url));
//   }

//   // ── 2. Guest hits protected route → send to /login ──
//   const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
//   if (isProtected && !isLoggedIn) {
//     const loginUrl = new URL("/login", req.url);
//     loginUrl.searchParams.set("callbackUrl", pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   // ── 3. RBAC — wrong role for this route ──
//   if (isLoggedIn && isProtected) {
//     const segment  = pathname.split("/")[1]; // "customer" | "vendor" | "admin"
//     const roleMap: Record<string, string> = {
//       customer: "CUSTOMER",
//       vendor:   "VENDOR",
//       admin:    "ADMIN",
//     };
//     const required = roleMap[segment];
//     if (required && role !== required) {
//       const home = (role && ROLE_HOME[role]) ?? "/";
//       return NextResponse.redirect(new URL(home, req.url));
//     }
//   }

//   return NextResponse.next();
// };

// // Run middleware on all pages except static assets and API routes
// export const config = {
//   matcher: [
//     "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// };

// src/middleware.ts
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