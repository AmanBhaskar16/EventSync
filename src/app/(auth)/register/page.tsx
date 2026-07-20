// src/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Eye, EyeOff, UserPlus,
  Building2, User, CheckCircle2, ArrowLeft,
} from "lucide-react";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { registerSchema } from "@/lib/validators";
import { cn } from "@/lib/utils";
import type { RegisterInput } from "@/lib/validators";

type Role = "CUSTOMER" | "VENDOR";
type FormData = {
  name: string; email: string; phone: string;
  password: string; confirmPassword: string; role: Role;
};

const INITIAL_FORM: FormData = {
  name: "", email: "", phone: "", password: "", confirmPassword: "", role: "CUSTOMER",
};

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8)          score++;
  if (password.length >= 12)         score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];
  const colors = ["", "bg-red-500", "bg-amber-500", "bg-yellow-400", "bg-green-500", "bg-green-600"];
  return { score, label: labels[score], color: colors[score] };
}

export default function RegisterPage() {
  const router = useRouter();
  const [step,     setStep]     = useState<1 | 2>(1);
  const [form,     setForm]     = useState<FormData>(INITIAL_FORM);
  const [errors,   setErrors]   = useState<Partial<Record<keyof FormData, string>>>({});
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading,  setLoading]  = useState(false);

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validateStep2() {
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fe: typeof errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormData;
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
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form as RegisterInput),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { toast.error(data.error || "Registration failed."); return; }
      toast.success("Account created! Please sign in.");
      router.push("/login");
    } catch { toast.error("Network error. Please try again."); }
    finally   { setLoading(false); }
  }

  const pwStrength = getPasswordStrength(form.password);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">Join EventSync — free to get started</p>
      </div>

      <div className="flex items-center gap-2">
        {([1, 2] as const).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              "size-6 rounded-full flex items-center justify-center text-xs font-bold transition-all",
              step === s ? "bg-primary text-primary-foreground"
                : step > s ? "bg-green-600 text-white"
                : "bg-muted text-muted-foreground"
            )}>
              {step > s ? <CheckCircle2 className="size-3.5" /> : s}
            </div>
            <span className={cn("text-xs font-medium", step === s ? "text-foreground" : "text-muted-foreground")}>
              {s === 1 ? "Choose role" : "Your details"}
            </span>
            {s < 2 && <div className="w-8 h-px bg-border mx-1" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">How will you use EventSync?</p>
          <div className="grid grid-cols-2 gap-3">
            {([
              { role: "CUSTOMER" as Role, icon: User,      title: "Plan Events",       desc: "Browse vendors, build your event, track budgets" },
              { role: "VENDOR"   as Role, icon: Building2, title: "Grow My Business",  desc: "Manage bookings, inventory, staff & finances" },
            ]).map(({ role, icon: Icon, title, desc }) => (
              <button key={role} type="button" onClick={() => set("role", role)}
                className={cn(
                  "relative flex flex-col items-start gap-3 rounded-xl border-2 p-4 text-left transition-all hover:border-primary/50 hover:bg-accent/50",
                  form.role === role ? "border-primary bg-primary/5 shadow-sm" : "border-border"
                )}>
                <div className={cn("flex size-10 items-center justify-center rounded-lg transition-colors",
                  form.role === role ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</div>
                </div>
                {form.role === role && <CheckCircle2 className="absolute top-3 right-3 size-4 text-primary" />}
              </button>
            ))}
          </div>
          <Button className="w-full" size="lg" onClick={() => setStep(2)}>Continue</Button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <button type="button" onClick={() => setStep(1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-3.5" /> Back
          </button>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full name" htmlFor="name" required error={errors.name} className="col-span-2">
              <Input id="name" autoComplete="name" placeholder="Priya Sharma" value={form.name}
                onChange={(e) => set("name", e.target.value)} error={!!errors.name} />
            </FormField>
            <FormField label="Email" htmlFor="email" required error={errors.email} className="col-span-2">
              <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email}
                onChange={(e) => set("email", e.target.value)} error={!!errors.email} />
            </FormField>
            <FormField label="Mobile" htmlFor="phone" required error={errors.phone} className="col-span-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">+91</span>
                <Input id="phone" type="tel" autoComplete="tel" placeholder="98765 43210" value={form.phone}
                  onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  error={!!errors.phone} className="pl-10" />
              </div>
            </FormField>
            <FormField label="Password" htmlFor="password" required error={errors.password}>
              <div className="relative">
                <Input id="password" type={showPass ? "text" : "password"} autoComplete="new-password"
                  placeholder="••••••••" value={form.password}
                  onChange={(e) => set("password", e.target.value)} error={!!errors.password} className="pr-9" />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className={cn("h-1 flex-1 rounded-full transition-all",
                        i <= pwStrength.score ? pwStrength.color : "bg-muted")} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{pwStrength.label}</p>
                </div>
              )}
            </FormField>
            <FormField label="Confirm" htmlFor="confirm" required error={errors.confirmPassword}>
              <div className="relative">
                <Input id="confirm" type={showConf ? "text" : "password"} autoComplete="new-password"
                  placeholder="••••••••" value={form.confirmPassword}
                  onChange={(e) => set("confirmPassword", e.target.value)}
                  error={!!errors.confirmPassword} className="pr-9" />
                <button type="button" onClick={() => setShowConf((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConf ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </FormField>
          </div>
          <p className="text-xs text-muted-foreground">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">Terms</Link>{" "}and{" "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            <UserPlus className="size-4" /> Create account
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">Sign in</Link>
      </p>
    </div>
  );
}