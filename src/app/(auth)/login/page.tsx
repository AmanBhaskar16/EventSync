
// Login form — email + password.
// On success: reads session role → redirects to role dashboard.
// Demo buttons pre-fill credentials for quick testing.

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { loginSchema } from "@/lib/validators";

// Where each role goes after login
const ROLE_HOME: Record<string, string> = {
  CUSTOMER: "/customer/dashboard",
  VENDOR:   "/vendor/dashboard",
  ADMIN:    "/admin/dashboard",
};

// Demo accounts — filled by clicking the row
const DEMO_ACCOUNTS = [
  { role: "Customer", email: "customer@demo.com" },
  { role: "Vendor",   email: "vendor@demo.com"   },
  { role: "Admin",    email: "admin@demo.com"     },
];

export default function LoginPage() {
  const router      = useRouter();
  const params      = useSearchParams();
  const callbackUrl = params.get("callbackUrl");

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Client-side Zod validation
  function validate() {
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fe: Partial<typeof form> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof typeof form;
        if (!fe[key]) fe[key] = issue.message;
      }
      setErrors(fe);
      return false;
    }
    setErrors({});
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setAuthError("");

    const res = await signIn("credentials", {
      email:    form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setAuthError("Invalid email or password. Please try again.");
      return;
    }

    toast.success("Welcome back!");

    // Get role from session to redirect correctly
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role as string | undefined;

    const destination =
      callbackUrl && callbackUrl.startsWith("/")
        ? callbackUrl
        : (role && ROLE_HOME[role]) ?? "/";

    router.push(destination);
    router.refresh();
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your EventSync account
        </p>
      </div>

      {/* Auth error banner */}
      {authError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {authError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>

        <FormField label="Email address" htmlFor="email" required error={errors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => {
              setForm((f) => ({ ...f, email: e.target.value }));
              setAuthError("");
            }}
            error={!!errors.email}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" required error={errors.password}>
          <div className="relative">
            <Input
              id="password"
              type={showPass ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => {
                setForm((f) => ({ ...f, password: e.target.value }));
                setAuthError("");
              }}
              error={!!errors.password}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </FormField>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-primary hover:underline underline-offset-4"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          <LogIn className="size-4" />
          Sign in
        </Button>

      </form>

      {/* Demo accounts */}
      <div className="rounded-lg border border-dashed border-border p-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Demo accounts (password: Demo@1234)
        </p>
        {DEMO_ACCOUNTS.map((d) => (
          <button
            key={d.role}
            type="button"
            onClick={() => setForm({ email: d.email, password: "Demo@1234" })}
            className="w-full text-left text-xs px-3 py-2 rounded-md hover:bg-muted transition-colors flex items-center justify-between group"
          >
            <span className="font-medium">{d.role}</span>
            <span className="text-muted-foreground font-mono group-hover:text-foreground">
              {d.email}
            </span>
          </button>
        ))}
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-primary font-medium hover:underline underline-offset-4"
        >
          Create account
        </Link>
      </p>

    </div>
  );
}