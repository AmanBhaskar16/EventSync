
// NextAuth v5 catch-all handler.
// This single file handles ALL of:
//   GET  /api/auth/session
//   GET  /api/auth/csrf
//   GET  /api/auth/providers
//   POST /api/auth/signin/credentials
//   POST /api/auth/signout
//   GET  /api/auth/callback/*
//
// Do NOT add any custom logic here.
// All NextAuth config lives in src/lib/auth/index.ts

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;