
// Landing page — hero, features, event types, role cards, CTA.

import Link from "next/link";
import {
  CalendarCheck, ArrowRight, 
  Users, Shield, FileText, CheckCircle,MessageSquare, CreditCard,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon:  CalendarCheck,
    title: "Event & Booking Management",
    desc:  "Create events, discover verified vendors, send inquiries and manage your entire booking lifecycle in one place.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon:  Users,
    title: "Verified Vendor Network",
    desc:  "Browse KYC-verified vendors across 17 categories — catering, decor, photography and more.",
    color: "bg-blue-100 text-blue-700",
  },
  {
    icon:  CreditCard,
    title: "Milestone Payments",
    desc:  "3-stage payment schedule (30/40/30%) via Stripe with sequential unlocking and server-side verification.",
    color: "bg-green-100 text-green-700",
  },
  {
    icon:  MessageSquare,
    title: "Real-time Messaging",
    desc:  "Instant chat between customers and vendors with typing indicators and Socket.io powered live notifications.",
    color: "bg-amber-100 text-amber-700",
  },
  {
    icon:  FileText,
    title: "GST Invoice Engine",
    desc:  "Auto-generate GST-compliant PDF invoices with line items, tax breakdown and instant download support.",
    color: "bg-purple-100 text-purple-700",
  },
  {
    icon:  Shield,
    title: "Admin Control Panel",
    desc:  "Platform-wide analytics, KYC review queue, dispute resolution and vendor payout management with commission tracking.",
    color: "bg-rose-100 text-rose-700",
  },
];

const EVENT_TYPES = [
  "💍 Wedding", "🎂 Birthday", "🥂 Bachelorette",
  "🎊 Engagement", "💼 Corporate", "🌸 Baby Shower",
  "🍵 Kitty Party", "🤝 Reunion", "🎤 Cocktail Party",
  "🎉 Anniversary", "🎓 Graduation", "✨ Any Event",
];

const ROLES_DETAILS = [
  {
    emoji: User, 
    role: "Customer",
    headline: "Plan events that wow",
    points: [
      "Visual Event Builder with timeline",
      "Browse & compare 2,400+ vendors",
      "Quote negotiation & milestone payments",
      "Real-time event tracker",
    ],
    href: "/register",
    cta:  "Start planning",
    cls:  "border-primary/30 bg-primary/5",
  },
  {
    emoji: Users, 
    role: "Vendor",
    headline: "Run your entire operation",
    points: [
      "Smart booking pipeline (CRM-style)",
      "Fractional inventory management",
      "Staff assignment & scheduling",
      "GST invoice generation",
    ],
    href: "/register?role=VENDOR",
    cta:  "List your business",
    cls:  "border-blue-200 bg-blue-50",
  },
  {
    emoji: Shield, 
    role: "Admin",
    headline: "Manage the ecosystem",
    points: [
      "Vendor KYC review & verification",
      "Platform-wide revenue analytics",
      "Commission & payout management",
      "Dispute resolution centre",
    ],
    href: "/about",
    cta:  "Learn more",
    cls:  "border-amber-200 bg-amber-50",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <CalendarCheck className="size-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Event<span className="text-primary">Sync</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-sm">
              {[
                { label: "Vendors",  href: "/vendors"  },
                { label: "Pricing",  href: "/pricing"  },
                { label: "About",    href: "/about"    },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Get started free</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        {/* Gradient blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 right-1/4 h-125 w-125 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute top-1/2 -left-24 h-100 w-100 rounded-full bg-chart-2/10 blur-[80px]" />
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <Badge variant="outline" className="mb-6 gap-2 px-4 py-1.5 text-xs font-medium tracking-wide uppercase border-primary/30 text-primary/80">
            🇮🇳 Built for India&apos;s event industry
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
            Every event.{" "}
            <span className="text-primary">Every vendor.</span>
            <br />
            One platform.
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            EventSync is the all-in-one ERP for event planning — from intimate kitty parties
            to grand weddings. Plan, book, track, and pay with confidence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/register">
                Start planning free <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register?role=VENDOR">List your business</Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            No credit card required · Free forever for customers
          </p>
        </div>
      </section>

      {/* ── Event type chips ── */}
      <section className="py-8 border-y border-border/50 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {EVENT_TYPES.map((type) => (
              <span
                key={type}
                className="rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "2,400+",  label: "Verified Vendors"   },
              { value: "18,000+", label: "Events Delivered"   },
              { value: "₹48Cr+",  label: "Transaction Volume" },
              { value: "4.8★",    label: "Platform Rating"    },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl sm:text-4xl font-bold">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 sm:py-24 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <Badge variant="outline">Platform&apos;s popular features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything in one workspace
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-6 hover:shadow-md hover:border-primary/20 transition-all"
              >
                <div className={`size-10 rounded-lg flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Three roles ── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <Badge variant="outline">Who it&apos;s for</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Three tailored experiences
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {ROLES_DETAILS.map((r) => (
              <div key={r.role} className={`rounded-2xl border-2 p-6 space-y-5 ${r.cls}`}>
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{typeof r.emoji === 'string' ? r.emoji : <r.emoji className="size-6" />}</span>
                  <Badge variant="outline" className="text-xs">{r.role}</Badge>
                </div>
                <h3 className="text-lg font-bold">{r.headline}</h3>
                <ul className="space-y-2">
                  {r.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="size-4 text-green-600 mt-0.5 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={r.href}>{r.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-24 bg-primary">
        <div className="mx-auto max-w-3xl px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground">
            Ready to transform how you plan events?
          </h2>
          <p className="text-primary-foreground/70 text-base max-w-lg mx-auto">
            Join thousands of event planners and vendors across India.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">Get started free</Link>
            </Button>
            <Button
              size="lg"
              className="bg-white/10 text-white border border-white/20 hover:bg-white/20"
              asChild
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <CalendarCheck className="size-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">
              Event<span className="text-primary">Sync</span>
            </span>
          </Link>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} EventSync. Made with ❤️ for India.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}