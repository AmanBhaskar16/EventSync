
// Server component — fetches platform-wide stats from DB.
// Shows GMV, vendor counts, KYC queue, open disputes.

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import {
  Users, Building2, TrendingUp, AlertCircle,
  UserCheck, CreditCard, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // All queries in parallel
  const [
    totalVendors,
    pendingKYC,
    totalCustomers,
    totalBookings,
    activeDisputes,
    pendingVendors,
    openDisputes,
    gmvResult,
  ] = await Promise.all([
    prisma.vendor.count(),
    prisma.vendor.count({ where: { kycStatus: "PENDING" } }),
    prisma.customer.count(),
    prisma.booking.count(),
    prisma.dispute.count({ where: { status: "OPEN" } }),
    prisma.vendor.findMany({
      where:   { kycStatus: "PENDING" },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take:    5,
    }),
    prisma.dispute.findMany({
      where:   { status: "OPEN" },
      include: { booking: { 
        include: { 
          vendor: { 
            select: { 
              businessName: true 
            } 
          } 
        } 
      } 
    },
      orderBy: { createdAt: "desc" },
      take:    5,
    }),
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum:  { amount: true },
    }),
  ]);

  const totalGMV = Number((gmvResult as { _sum: { amount?: number } })._sum.amount ?? 0);

  const vendors  = pendingVendors as unknown as Array<{
    id: string; 
    businessName: string; 
    kycStatus: string; 
    createdAt: Date;
    user: { email: string };
  }>;
  const disputes = openDisputes as unknown as Array<{
    id: string; 
    reason: string; 
    status: string;
    booking: { vendor: { businessName: string } };
  }>;

  return (
    <div className="space-y-8 max-w-6xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Platform-wide overview and moderation queue.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Total GMV",      value: formatCurrency(totalGMV), icon: TrendingUp,  color: "text-primary",    href: "/admin/analytics" },
          { label: "Total Vendors",  value: totalVendors,             icon: Building2,   color: "text-blue-600",   href: "/admin/vendors"   },
          { label: "Customers",      value: totalCustomers,           icon: Users,        color: "text-purple-600", href: "/admin/customers" },
          { label: "Total Bookings", value: totalBookings,            icon: CreditCard,   color: "text-green-600",  href: "/admin/bookings"  },
          { label: "Pending KYC",    value: pendingKYC,              icon: UserCheck,    color: "text-amber-600",  href: "/admin/kyc"       },
          { label: "Open Disputes",  value: activeDisputes,           icon: AlertCircle,  color: "text-red-600",    href: "/admin/disputes"  },
        ].map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                    <p className="text-2xl font-bold mt-1">{s.value}</p>
                  </div>
                  <s.icon className={`size-8 ${s.color} opacity-60`} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Alert banners */}
      {(pendingKYC > 0 || activeDisputes > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {pendingKYC > 0 && (
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
              <UserCheck className="size-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  {pendingKYC} vendor{pendingKYC !== 1 ? "s" : ""} awaiting KYC review
                </p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="/admin/kyc">Review now</Link>
                </Button>
              </div>
            </div>
          )}
          {activeDisputes > 0 && (
            <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 flex items-start gap-3">
              <AlertCircle className="size-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-900">
                  {activeDisputes} open dispute{activeDisputes !== 1 ? "s" : ""} need resolution
                </p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="/admin/disputes">Resolve</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">

        {/* KYC queue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">KYC Review Queue</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/kyc">All <ArrowRight className="size-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {vendors.length === 0 ? (
              <div className="text-center py-10">
                <UserCheck className="size-8 mx-auto text-muted-foreground opacity-40 mb-2" />
                <p className="text-sm text-muted-foreground">No pending applications</p>
              </div>
            ) : (
              <div className="space-y-2">
                {vendors.map((v) => (
                  <Link
                    key={v.id}
                    href={`/admin/kyc/${v.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{v.businessName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{v.user.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                      <Badge variant="warning" className="text-[10px]">Pending</Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(v.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open disputes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Open Disputes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/disputes">All <ArrowRight className="size-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {disputes.length === 0 ? (
              <div className="text-center py-10">
                <AlertCircle className="size-8 mx-auto text-muted-foreground opacity-40 mb-2" />
                <p className="text-sm text-muted-foreground">No open disputes</p>
              </div>
            ) : (
              <div className="space-y-2">
                {disputes.map((d) => (
                  <Link
                    key={d.id}
                    href={`/admin/disputes/${d.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {d.booking.vendor.businessName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{d.reason}</p>
                    </div>
                    <Badge variant="destructive" className="text-[10px] shrink-0 ml-3">Open</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}