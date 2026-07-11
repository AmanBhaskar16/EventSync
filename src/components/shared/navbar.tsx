"use client";

import Link            from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { CalendarCheck, Menu, X, ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn }    from "@/lib/utils";

const ROLE_HOME: Record<string, string> = {
  CUSTOMER: "/customer/dashboard",
  VENDOR:   "/vendor/dashboard",
  ADMIN:    "/admin/dashboard",
};

const NAV_LINKS = [
  { label: "Find Vendors", 
    href: "/vendors" 
  },
  { 
    label: "About", 
    href: "/about"
  },
];

export function Navbar() {
  const pathname  = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen]   = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isLoggedIn = status === "authenticated";
  const user = session?.user;
  const dashHome = user?.role ? (ROLE_HOME[user.role] ?? "/") : "/";
  const initials = (user?.name ?? "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <CalendarCheck className="size-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Event<span className="text-primary">Sync</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith(href)
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {status === "loading" ? (
              <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />
            ) : isLoggedIn ? (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors"
                >
                  <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {initials}
                  </div>
                  <span className="text-sm font-medium max-w-30 truncate">{user?.name ?? user?.email}</span>
                  <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform", dropOpen && "rotate-180")} />
                </button>
                {dropOpen && (
                  <div className="absolute right-0 mt-1 w-52 rounded-xl border border-border bg-popover shadow-lg overflow-hidden z-50">
                    <div className="px-3 py-2.5 border-b border-border">
                      <p className="text-xs font-semibold truncate">{user?.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <Link href={dashHome} className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-muted w-full" onClick={() => setDropOpen(false)}>
                        <LayoutDashboard className="size-4 text-muted-foreground" /> Dashboard
                      </Link>
                      <hr className="my-1 border-border" />
                      <button
                        onClick={() => { setDropOpen(false); signOut({ callbackUrl: "/" }); }}
                        className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-destructive/10 hover:text-destructive w-full text-left"
                      >
                        <LogOut className="size-4" /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild><Link href="/login">Sign in</Link></Button>
                <Button size="sm" asChild><Link href="/register">Get started</Link></Button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="block px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted/50"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          <hr className="border-border my-2" />
          {isLoggedIn ? (
            <>
              <Link href={dashHome} className="block px-3 py-2.5 rounded-md text-sm font-medium hover:bg-muted" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <button onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }} className="w-full text-left px-3 py-2.5 rounded-md text-sm text-destructive hover:bg-destructive/10">Sign out</button>
            </>
          ) : (
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="flex-1" asChild><Link href="/login" onClick={() => setMobileOpen(false)}>Sign in</Link></Button>
              <Button size="sm" className="flex-1" asChild><Link href="/register" onClick={() => setMobileOpen(false)}>Register</Link></Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}