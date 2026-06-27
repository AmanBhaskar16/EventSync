
// URL: wraps /customer/* /vendor/* /admin/*

// Server component — reads session on server, redirects if unauthenticated.
// Renders the dark sidebar with role-aware nav links + main content area.
//
// (dashboard) is a Next.js Route Group — does NOT appear in the URL.

import { auth }         from "@/lib/auth";
import { redirect }     from "next/navigation";
import Link             from "next/link";
import {
  CalendarCheck, LayoutDashboard, CalendarDays,
  Users, Package, FileText, CreditCard, BarChart3,
  Shield, UserCheck, AlertCircle, Settings, LogOut,
} from "lucide-react";

// Nav items per role
const NAV = {
  CUSTOMER: [
    { label: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
    { label: "My Events",  href: "/customer/events",    icon: CalendarDays    },
    { label: "Bookings",   href: "/customer/bookings",  icon: Users           },
    { label: "Payments",   href: "/customer/payments",  icon: CreditCard      },
  ],
  VENDOR: [
    { label: "Dashboard",  href: "/vendor/dashboard",  icon: LayoutDashboard },
    { label: "Bookings",   href: "/vendor/bookings",   icon: CalendarDays    },
    { label: "Inventory",  href: "/vendor/inventory",  icon: Package         },
    { label: "Staff",      href: "/vendor/staff",      icon: Users           },
    { label: "Documents",  href: "/vendor/documents",  icon: FileText        },
    { label: "Finances",   href: "/vendor/finances",   icon: BarChart3       },
  ],
  ADMIN: [
    { label: "Dashboard",  href: "/admin/dashboard",   icon: LayoutDashboard },
    { label: "Vendors",    href: "/admin/vendors",     icon: Shield          },
    { label: "KYC Review", href: "/admin/kyc",         icon: UserCheck       },
    { label: "Disputes",   href: "/admin/disputes",    icon: AlertCircle     },
    { label: "Payouts",    href: "/admin/payouts",     icon: CreditCard      },
    { label: "Analytics",  href: "/admin/analytics",   icon: BarChart3       },
  ],
} as const;

type Role = keyof typeof NAV;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // auth() reads the JWT cookie — runs on the server
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role     = session.user.role as Role;
  const nav      = NAV[role] ?? [];
  const initials = (session.user.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden lg:flex w-60 flex-col bg-sidebar border-r border-sidebar-border shrink-0">

        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-5 border-b border-sidebar-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <CalendarCheck className="size-4 text-primary-foreground" />
          </div>
          <span className="text-base font-bold text-sidebar-foreground tracking-tight">
            Event<span className="text-sidebar-primary">Sync</span>
          </span>
        </div>

        {/* Role label */}
        <div className="px-4 py-3 border-b border-sidebar-border">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            {role.charAt(0) + role.slice(1).toLowerCase()} Portal
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {nav.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all group"
            >
              <Icon className="size-4 shrink-0 group-hover:text-sidebar-primary transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom: settings + signout + user chip */}
        <div className="border-t border-sidebar-border p-3 space-y-0.5">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
          >
            <Settings className="size-4" /> Settings
          </Link>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="size-4" /> Sign out
          </Link>

          {/* User chip */}
          <div className="mt-2 flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2">
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-sidebar-primary shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">
                {session.user.name ?? "User"}
              </p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>

      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile top bar */}
        <header className="lg:hidden flex h-14 items-center justify-between px-4 border-b border-border bg-background">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <CalendarCheck className="size-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">EventSync</span>
          </Link>
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {initials}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

      </div>
    </div>
  );
}