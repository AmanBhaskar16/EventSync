
"use client";

import { useState }       from "react";
import Link               from "next/link";
import { toast }          from "sonner";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { Button }         from "@/components/ui/button";
import { Input }          from "@/components/ui/input";
import { FormField }      from "@/components/ui/form-field";
import { forgotPasswordSchema } from "@/lib/validators";

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    setLoading(true);

    // Simulated delay — replace with actual API call when email is configured
    await new Promise((r) => setTimeout(r, 1000));

    setLoading(false);
    setSubmitted(true);
    toast.success("Reset link sent if the email exists.");
  }

  // ── Success screen ──
  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto size-16 rounded-full bg-green-100 flex items-center justify-center">
          <Mail className="size-8 text-green-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Check your inbox</h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            We sent a password reset link to{" "}
            <span className="font-medium text-foreground">{email}</span>.
            It expires in 30 minutes.
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Didn&apos;t receive it? Check your spam folder or try a different address.
          </p>
          <Button variant="outline" className="w-full" onClick={() => setSubmitted(false)}>
            Try a different email
          </Button>
        </div>
        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to sign in
        </Link>
      </div>
    );
  }

  // ── Request screen ──
  return (
    <div className="space-y-6">

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>

        <FormField label="Email address" htmlFor="email" required error={error}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            error={!!error}
          />
        </FormField>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          <Send className="size-4" />
          Send reset link
        </Button>

      </form>

      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" /> Back to sign in
      </Link>

    </div>
  );
}