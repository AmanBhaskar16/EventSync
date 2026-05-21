
// URL: /vendor/dashboard

import { auth }     from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma }   from "@/lib/db/prisma";
import Link         from "next/link";
import {
  TrendingUp, CalendarDays, Users, Package,
  Star, AlertCircle, ArrowRight, IndianRupee,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge }    from "@/components/ui/badge";
import {
  getGreeting, formatCurrency, formatDate,
  BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS,
} from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Vendor Dashboard" };

// ── Local types ───────────────────────────────────────────────────────────────

type BookingRow = {
  id:          string;
  status:      string;
  agreedPrice: number | null;
  createdAt:   Date;
  event: {
    id:        string;
    title:     string;
    eventDate: Date;
    city:      string | null;
    type:      string;
  };
};

type InventoryRow = {
  id:             string;
  name:           string;
  totalQuantity:  number;
  maintenanceQty: number;
  unit:           string;
};

type VendorRow = {
  id:             string;
  businessName:   string;
  category:       string;
  kycStatus:      string;
  isVerified:     boolean;
  avgRating:      number;
  totalReviews:   number;
  totalBookings:  number;
  responseTime:   number;
  tier:           string;
  bookings:       BookingRow[];
  inventoryItems: InventoryRow[];
};

// ─────────────────────────────────────────────────────────────────────────────

export default async function VendorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const raw = await prisma.vendor.findUnique({
    where:   { userId: session.user.id },
    include: {
      bookings: {
        include: {
          event: {
            select: { id: true, title: true, eventDate: true, city: true, type: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take:    20,
      },
      inventoryItems: {
        orderBy: { name: "asc" },
        take:    6,
      },
    },
  });

  if (!raw) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="size-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-semibold">Complete your vendor profile</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Set up your business details to start receiving bookings.
          </p>
          <Button asChild>
            <Link href="/vendor/onboarding">Complete setup</Link>
          </Button>
        </div>
      </div>
    );
  }

  const vendor     = raw as unknown as VendorRow;
  const now        = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStart  = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  // Segment bookings
  const confirmed   = vendor.bookings.filter((b) => b.status === "CONFIRMED");
  const completed   = vendor.bookings.filter((b) => b.status === "COMPLETED");
  const pending     = vendor.bookings.filter((b) =>
    ["INQUIRY", "QUOTE_SENT", "NEGOTIATION"].includes(b.status)
  );
  const upcoming    = vendor.bookings.filter((b) =>
    b.status === "CONFIRMED" && new Date(b.event.eventDate) > now
  );

  // Revenue calculations
  const totalRevenue = [...confirmed, ...completed]
    .reduce((sum, b) => sum + (b.agreedPrice ?? 0), 0);
  const monthRevenue = [...confirmed, ...completed]
    .filter((b) => new Date(b.createdAt) >= monthStart)
    .reduce((sum, b) => sum + (b.agreedPrice ?? 0), 0);
  const weekRevenue  = [...confirmed, ...completed]
    .filter((b) => new Date(b.createdAt) >= weekStart)
    .reduce((sum, b) => sum + (b.agreedPrice ?? 0), 0);

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  const statCards: Array<{
    label: string; value: string | number;
    icon: React.ElementType; color: string; href: string;
  }> = [
    {
      label: "Total Revenue",    value: formatCurrency(totalRevenue),
      icon: IndianRupee,         color: "text-primary",    href: "/vendor/finances",
    },
    {
      label: "This Month",       value: formatCurrency(monthRevenue),
      icon: TrendingUp,          color: "text-blue-600",   href: "/vendor/finances",
    },
    {
      label: "Pending",          value: pending.length,
      icon: Users,               color: "text-amber-600",  href: "/vendor/bookings",
    },
    {
      label: "Avg Rating",
      value: vendor.avgRating > 0 ? `${vendor.avgRating.toFixed(1)} ★` : "No reviews yet",
      icon: Star,                color: "text-yellow-500", href: "/vendor/reviews",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Good {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            {vendor.businessName}
            {vendor.isVerified
              ? <span className="text-green-600 font-medium text-xs">✅ Verified</span>
              : <span className="text-amber-600 font-medium text-xs">⏳ KYC Pending</span>
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/vendor/bookings">All bookings</Link>
          </Button>
          <Button asChild>
            <Link href="/vendor/services">Manage services</Link>
          </Button>
        </div>
      </div>

      {/* KYC warning */}
      {vendor.kycStatus !== "APPROVED" && (
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">KYC verification pending</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Your profile is not visible to customers until KYC is approved.
              Submit your GST certificate, PAN card, and business registration.
            </p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/vendor/kyc">Complete KYC now</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                    <p className="text-xl font-bold mt-1 leading-tight">{s.value}</p>
                  </div>
                  <s.icon className={`size-7 opacity-60 ${s.color} shrink-0`} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Revenue mini-summary */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 grid grid-cols-3 gap-4 text-center">
        {[
          { label: "This Week",  value: formatCurrency(weekRevenue)  },
          { label: "This Month", value: formatCurrency(monthRevenue) },
          { label: "All Time",   value: formatCurrency(totalRevenue) },
        ].map((r) => (
          <div key={r.label}>
            <p className="text-xs text-muted-foreground">{r.label}</p>
            <p className="text-base font-bold mt-0.5">{r.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Pending — needs action */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Needs Action</CardTitle>
              {pending.length > 0 && (
                <span className="size-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {pending.length}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/vendor/bookings?status=INQUIRY">
                All <ArrowRight className="size-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {pending.length === 0 ? (
              <div className="text-center py-10">
                <CalendarDays className="size-8 mx-auto text-muted-foreground opacity-40 mb-2" />
                <p className="text-sm text-muted-foreground">No pending bookings — all clear! 🎉</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pending.slice(0, 5).map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/vendor/bookings/${booking.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{booking.event.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {booking.event.city ?? "—"} &middot; {formatDate(booking.event.eventDate)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 ml-2 ${BOOKING_STATUS_COLORS[booking.status] ?? ""}`}
                    >
                      {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming confirmed events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Upcoming Events</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/vendor/bookings?status=CONFIRMED">
                All <ArrowRight className="size-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {upcoming.length === 0 ? (
              <div className="text-center py-10">
                <CalendarDays className="size-8 mx-auto text-muted-foreground opacity-40 mb-2" />
                <p className="text-sm text-muted-foreground">No confirmed upcoming events</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcoming.slice(0, 5).map((booking) => {
                  const daysLeft = Math.ceil(
                    (new Date(booking.event.eventDate).getTime() - now.getTime()) / 86400000
                  );
                  return (
                    <Link
                      key={booking.id}
                      href={`/vendor/bookings/${booking.id}`}
                      className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{booking.event.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {booking.event.city ?? "—"} &middot; {formatDate(booking.event.eventDate)}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className={`text-xs font-semibold ${daysLeft <= 7 ? "text-red-600" : daysLeft <= 14 ? "text-amber-600" : "text-green-600"}`}>
                          {daysLeft === 0 ? "Today!" : `${daysLeft}d away`}
                        </p>
                        {booking.agreedPrice && (
                          <p className="text-[10px] text-muted-foreground">
                            {formatCurrency(booking.agreedPrice)}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory snapshot */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Inventory</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/vendor/inventory">
                Manage <ArrowRight className="size-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {vendor.inventoryItems.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Package className="size-8 mx-auto text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground">No inventory items added yet</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/vendor/inventory/new">Add inventory</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {vendor.inventoryItems.map((item) => {
                  const available = item.totalQuantity - item.maintenanceQty;
                  const pct       = item.totalQuantity > 0
                    ? Math.round((available / item.totalQuantity) * 100) : 0;
                  const barColor  = pct > 50 ? "bg-green-500" : pct > 20 ? "bg-amber-500" : "bg-red-500";
                  const label     = pct > 50 ? "Good" : pct > 20 ? "Low" : "Critical";
                  return (
                    <div key={item.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate">{item.name}</span>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-xs text-muted-foreground">
                            {available}/{item.totalQuantity} {item.unit}
                          </span>
                          <span className={`text-[10px] font-semibold ${
                            pct > 50 ? "text-green-600" : pct > 20 ? "text-amber-600" : "text-red-600"
                          }`}>{label}</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <Button variant="ghost" size="sm" className="w-full mt-1" asChild>
                  <Link href="/vendor/inventory">View all inventory</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Performance</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {[
              { label: "Total bookings received", value: vendor.totalBookings },
              { label: "Completed events",        value: completed.length     },
              { label: "Pending inquiries",       value: pending.length       },
              { label: "Avg response time",       value: `${vendor.responseTime}h` },
              { label: "Total reviews",           value: vendor.totalReviews  },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}