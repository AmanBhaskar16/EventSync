// src/app/(dashboard)/vendor/dashboard/page.tsx
// URL: /vendor/dashboard

import { auth }     from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma }   from "@/lib/db/prisma";
import Link         from "next/link";
import {
  TrendingUp, CalendarDays, Users, Package,
  Star, AlertCircle, ArrowRight,
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

type BookingRow = {
  id:          string;
  status:      string;
  agreedPrice: number | null;
  createdAt:   Date;
  event: { title: string; eventDate: Date; city: string | null };
};

type InventoryRow = {
  id: string; name: string;
  totalQuantity: number; maintenanceQty: number; unit: string;
};

type VendorRow = {
  id: string; businessName: string; kycStatus: string; avgRating: number;
  bookings: BookingRow[];
  inventoryItems: InventoryRow[];
};

export default async function VendorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const raw = await prisma.vendor.findUnique({
    where:   { userId: session.user.id },
    include: {
      bookings: {
        include: { event: { select: { title: true, eventDate: true, city: true } } },
        orderBy: { createdAt: "desc" },
        take:    10,
      },
      inventoryItems: { orderBy: { name: "asc" }, take: 5 },
    },
  });

  if (!raw) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="size-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-semibold">Complete your vendor profile</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Set up your business profile to start receiving bookings.
          </p>
          <Button asChild>
            <Link href="/vendor/onboarding">Complete setup</Link>
          </Button>
        </div>
      </div>
    );
  }

  const vendor = raw as unknown as VendorRow;

  const now        = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const confirmed    = vendor.bookings.filter((b) => b.status === "CONFIRMED");
  const pending      = vendor.bookings.filter((b) =>
    ["INQUIRY", "QUOTE_SENT", "NEGOTIATION"].includes(b.status)
  );
  const totalRevenue = confirmed.reduce((sum, b) => sum + (b.agreedPrice ?? 0), 0);
  const monthRevenue = confirmed
    .filter((b) => new Date(b.createdAt) >= monthStart)
    .reduce((sum, b) => sum + (b.agreedPrice ?? 0), 0);

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  const stats: Array<{ label: string; value: string; icon: React.ElementType; color: string }> = [
    { label: "Total Revenue",    value: formatCurrency(totalRevenue),  icon: TrendingUp,  color: "text-primary"   },
    { label: "This Month",       value: formatCurrency(monthRevenue),  icon: CalendarDays, color: "text-blue-600"  },
    { label: "Pending Bookings", value: String(pending.length),        icon: Users,        color: "text-amber-600" },
    {
      label: "Avg Rating",
      value: vendor.avgRating > 0 ? `${vendor.avgRating.toFixed(1)} ★` : "—",
      icon:  Star, color: "text-yellow-500",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Good {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {vendor.businessName} &middot;{" "}
            {vendor.kycStatus === "APPROVED"
              ? <span className="text-green-600 font-medium">Verified ✅</span>
              : <span className="text-amber-600 font-medium">KYC Pending ⏳</span>
            }
          </p>
        </div>
        <Button asChild>
          <Link href="/vendor/bookings">
            All bookings <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      {vendor.kycStatus !== "APPROVED" && (
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">KYC verification pending</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Submit your documents to appear in vendor search and receive bookings.
            </p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/vendor/kyc">Complete KYC</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                </div>
                <s.icon className={`size-8 opacity-60 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Needs Action</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/vendor/bookings">All <ArrowRight className="size-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {pending.length === 0 ? (
              <div className="text-center py-10">
                <CalendarDays className="size-8 mx-auto text-muted-foreground opacity-40 mb-2" />
                <p className="text-sm text-muted-foreground">No pending bookings</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pending.slice(0, 4).map((booking) => (
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Inventory Snapshot</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/vendor/inventory">Manage <ArrowRight className="size-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {vendor.inventoryItems.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Package className="size-8 mx-auto text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground">No inventory items yet</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/vendor/inventory/new">Add inventory</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {vendor.inventoryItems.map((item) => {
                  const available = item.totalQuantity - item.maintenanceQty;
                  const pct = item.totalQuantity > 0
                    ? Math.round((available / item.totalQuantity) * 100) : 0;
                  const barColor = pct > 50
                    ? "bg-green-500" : pct > 20 ? "bg-amber-500" : "bg-red-500";
                  return (
                    <div key={item.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate">{item.name}</span>
                        <span className="text-muted-foreground text-xs shrink-0 ml-2">
                          {available}/{item.totalQuantity} {item.unit}
                        </span>
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
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}