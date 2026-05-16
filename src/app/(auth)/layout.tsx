// src/app/(auth)/layout.tsx
// URL: wraps /login  /register  /forgot-password
//
// Split-panel layout:
//   Left  (hidden on mobile) — brand panel with gradient, stats, testimonial
//   Right — form area (children rendered here)
//
// The (auth) folder name is a Next.js Route Group.
// It groups routes together without affecting the URL — so:
//   (auth)/login/page.tsx       → /login        (NOT /auth/login)
//   (auth)/register/page.tsx    → /register
//   (auth)/forgot-password/...  → /forgot-password

import Link            from "next/link";
import { CalendarCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Sign In", template: "%s | EventSync" },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col relative overflow-hidden bg-sidebar">

        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 h-150 w-150 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute top-1/2 -right-20 h-100 w-100 rounded-full bg-chart-1/10 blur-[100px]" />
          <div className="absolute -bottom-32 left-1/3 h-125 w-125 rounded-full bg-primary/10 blur-[120px]" />
        </div>

        {/* Dot-grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize:  "28px 28px",
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
              <CalendarCheck className="size-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-sidebar-foreground tracking-tight">
              Event<span className="text-sidebar-primary">Sync</span>
            </span>
          </Link>

          {/* Headline */}
          <div className="mt-auto mb-8 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-sidebar-primary/30 bg-sidebar-primary/10 px-3 py-1">
              <span className="size-1.5 rounded-full bg-sidebar-primary animate-pulse" />
              <span className="text-xs font-medium text-sidebar-primary">
                India&apos;s #1 Event Platform
              </span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-sidebar-foreground leading-[1.15] tracking-tight">
              Plan events that
              <br />
              <span className="text-sidebar-primary">people remember.</span>
            </h1>

            <p className="text-sidebar-foreground/60 text-base max-w-sm leading-relaxed">
              From intimate kitty parties to grand weddings — manage vendors,
              budgets, and timelines all in one workspace.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { value: "2,400+",  label: "Verified Vendors"   },
              { value: "18,000+", label: "Events Delivered"   },
              { value: "₹48Cr+",  label: "Managed on Platform"},
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-white/5 border border-white/8 p-4"
              >
                <div className="text-2xl font-bold text-sidebar-foreground">{s.value}</div>
                <div className="text-xs text-sidebar-foreground/50 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="rounded-2xl bg-white/5 border border-white/8 p-5 space-y-3">
            <p className="text-sm text-sidebar-foreground/80 leading-relaxed italic">
              &ldquo;EventSync turned our chaotic wedding planning into a seamless
              experience. Every vendor, every payment — all in one place.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-xs font-bold text-sidebar-primary">
                P
              </div>
              <div>
                <div className="text-xs font-semibold text-sidebar-foreground">Priya &amp; Arjun</div>
                <div className="text-xs text-sidebar-foreground/50">Wedding, Mumbai</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Right: form area ── */}
      <div className="flex-1 flex flex-col">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 p-5 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <CalendarCheck className="size-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Event<span className="text-primary">Sync</span>
          </span>
        </div>

        {/* Form (children) */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-105">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} EventSync.&nbsp;
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            &nbsp;·&nbsp;
            <Link href="/terms"   className="hover:text-foreground transition-colors">Terms</Link>
          </p>
        </div>

      </div>
    </div>
  );
}