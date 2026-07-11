
// NextAuth v5 configuration.
//  // Exports: auth, handlers, signIn, signOut, hashPassword

// auth()    — use in Server Components / API routes to get session
// handlers  — export from app/api/auth/[...nextauth]/route.ts
// signIn()  — use from client via next-auth/react
// signOut() — use from client via next-auth/react

import NextAuth        from "next-auth";
import Credentials     from "next-auth/providers/credentials";
import bcrypt          from "bcryptjs";
import { prisma }      from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validators";
import { authConfig }  from "./config";
import type { Role }   from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where:  { email },
          select: {
            id:           true,
            email:        true,
            name:         true,
            avatar:       true,
            role:         true,
            passwordHash: true,
            isActive:     true,
          },
        });

        if (!user || !user.passwordHash || !user.isActive) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id:    user.id,
          email: user.email,
          name:  user.name,
          image: user.avatar,
          role:  user.role,
        };
      },
    }),
  ],
});

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}