import Link from "next/link";
import {
  CalendarCheck, Users, BarChart3, Shield,
  ArrowRight, Sparkles, Package, FileText,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Visual Event Builder",
    desc: "Drag-and-drop timeline canvas to design every element of your event with live budget tracking.",
    color: "text-primary bg-primary/10",
  },
  {
    icon: Users,
    title: "Verified Vendor Network",
    desc: "2,400+ KYC-verified vendors across 16 categories — catering, decor, photography, and more.",
    color: "text-chart-2 bg-chart-2/10",
  },
  {
    icon: Package,
    title: "Fractional Inventory",
    desc: "Book exactly what you need. Our availability engine tracks partial inventory across concurrent events.",
    color: "text-chart-3 bg-chart-3/10",
  },
  {
    icon: BarChart3,
    title: "Business Intelligence",
    desc: "Real-time dashboards showing revenue, net profit per event, staff costs, and expense breakdowns.",
    color: "text-chart-4 bg-chart-4/10",
  },
  {
    icon: FileText,
    title: "GST Document Engine",
    desc: "Auto-generate GST-compliant invoices, quotations, service agreements, and delivery challans.",
    color: "text-chart-5 bg-chart-5/10",
  },
  {
    icon: Shield,
    title: "Escrow & Milestone Payments",
    desc: "Split payments across booking, pre-event, and post-event milestones with secure escrow protection.",
    color: "text-success bg-success/10",
  },
];

const EVENT_TYPES = [
  "Wedding", "Birthday", "Bachelorette",
  "Anniversary", "Corporate", "Baby Shower",
  "Engagement", "Kitty Party", "Reunion",
  "Cocktail Party", "Bachelor Party", "Any Event",
];

const STATS = [
  { value: "2,400+", label: "Verified Vendors" },
  { value: "18,000+", label: "Events Delivered" },
  { value: "48Cr+", label: "Transaction Volume" },
  { value: "4.8", label: "Platform Rating" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
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

      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 right-1/4 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-chart-2/8 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <Badge variant="secondary" className="mb-6 inline-flex gap-1.5 px-3 py-1.5">
            <Sparkles className="size-3 text-primary" />
            <span>Built for India&apos;s event industry</span>
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
            Every event.{" "}
            <span className="text-primary">Every vendor.</span>
            <br />
            One platform.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            EventSync is the all-in-one ERP for event planning. Plan, book, track, and pay with confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="xl" asChild>
              <Link href="/register">
                Start planning free <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/register?role=VENDOR">List your business</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-8 border-y border-border/50 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {EVENT_TYPES.map((type) => (
              <span key={type} className="rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium">
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center space-y-1">
                <div className="text-3xl sm:text-4xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <Badge variant="outline">Platform features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything you need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Designed for the full event lifecycle.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-all duration-200">
                <div className={`size-10 rounded-lg flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-sidebar">
        <div className="mx-auto max-w-3xl px-4 text-center space-y-6">
          <div className="flex justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="size-5 fill-warning text-warning" />
            ))}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-sidebar-foreground tracking-tight">
            Ready to transform how you plan events?
          </h2>
          <p className="text-sidebar-foreground/60 text-base max-w-lg mx-auto">
            Join thousands of event planners and vendors who trust EventSync.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button size="xl" asChild>
              <Link href="/register">Get started — it&apos;s free</Link>
            </Button>
            <Button size="xl" variant="secondary" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <CalendarCheck className="size-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm">Event<span className="text-primary">Sync</span></span>
            </Link>
            <p className="text-xs text-muted-foreground">
              {String.fromCharCode(169)} {new Date().getFullYear()} EventSync. Made for India.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}