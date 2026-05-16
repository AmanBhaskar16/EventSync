// src/lib/validators/index.ts
//
// Zod schemas for Feature 1 — auth forms only.
// Used on both client (form validation) and server (API input validation).

import { z } from "zod";

// ─── Login ───────────────────────────────────

export const loginSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Register ────────────────────────────────

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .email("Invalid email address"),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
    role: z.enum(["CUSTOMER", "VENDOR"]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path:    ["confirmPassword"],
  });

// ─── Forgot password ─────────────────────────

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// ─── Type exports ─────────────────────────────

export type LoginInput         = z.infer<typeof loginSchema>;
export type RegisterInput      = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;