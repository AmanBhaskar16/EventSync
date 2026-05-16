// src/app/api/auth/register/route.ts
// URL: POST /api/auth/register
//
// Why this is separate from NextAuth:
//   NextAuth only handles sign-in/sign-out — it does NOT create accounts.
//   This is our own endpoint to create a new User row in the DB,
//   then create the matching Customer or Vendor profile in a single transaction.
//
// Flow:
//   1. Validate input with Zod
//   2. Check email is not already taken
//   3. Hash password with bcrypt
//   4. DB transaction: create User + Customer or Vendor
//   5. Return success → client redirects to /login

import { NextRequest, NextResponse } from "next/server";
import { prisma }                    from "@/lib/db/prisma";
import { hashPassword }              from "@/lib/auth";
import { registerSchema }            from "@/lib/validators";
import type { ApiResponse }          from "@/types";

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body   = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, phone, password, role } = parsed.data;

    // Check for duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Single transaction — User + profile created together
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name, email, phone, passwordHash, role },
      });

      if (role === "CUSTOMER") {
        await tx.customer.create({
          data: { userId: newUser.id },
        });
      } else if (role === "VENDOR") {
        await tx.vendor.create({
          data: {
            userId:       newUser.id,
            businessName: name,   // updated during onboarding
            category:     "OTHER",
            city:         "",
            state:        "",
            pincode:      "",
            serviceRadius: 50,
          },
        });
      }

      return newUser;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. Please sign in.",
        data:    { id: user.id, email: user.email, role: user.role },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[REGISTER]", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}