
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Users, Star, AlertCircle, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGreeting, formatCurrency } from "@/lib/utils";
import { StatGrid } from "@/components/dashboard/stat-card";
import { getVendorDashboardData } from "./_queries";
import { KycWarningBanner } from "./_components/kyc-warning-banner";
import { NeedsActionCard } from "./_components/needs-action-card";
import { UpcomingEventsCard } from "./_components/upcoming-events-card";
import { InventoryCard } from "./_components/inventory-card";
import { PerformanceCard } from "./_components/performance-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Vendor Dashboard" };

const VendorDashboardPage = async () => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = await getVendorDashboardData(session.user.id);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="size-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-semibold">Complete your vendor profile</h2>
          <p className="text-sm text-muted-foreground max-w-sm">Set up your business details to start receiving bookings.</p>
          <Button asChild><Link href="/vendor/onboarding">Complete setup</Link></Button>
        </div>
      </div>
    );
  }

  const { vendor, pending, upcoming, completed, totalRevenue, monthRevenue, weekRevenue } = data;
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  const stats = [
    { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: IndianRupee, color: "text-primary", href: "/vendor/finances" },
    { label: "This Month", value: formatCurrency(monthRevenue), icon: TrendingUp, color: "text-blue-600", href: "/vendor/finances" },
    { label: "Pending", value: pending.length, icon: Users, color: "text-amber-600", href: "/vendor/bookings" },
    { label: "Avg Rating", value: vendor.avgRating > 0 ? `${vendor.avgRating.toFixed(1)} ★` : "No reviews yet", icon: Star, color: "text-yellow-500", href: "/vendor/reviews" },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Good {getGreeting()}, {firstName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            {vendor.businessName}
            {vendor.isVerified
              ? <span className="text-green-600 font-medium text-xs">✅ Verified</span>
              : <span className="text-amber-600 font-medium text-xs">⏳ KYC Pending</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/vendor/bookings">All bookings</Link></Button>
          <Button asChild><Link href="/vendor/services">Manage services</Link></Button>
        </div>
      </div>

      {vendor.kycStatus !== "APPROVED" && <KycWarningBanner />}

      <StatGrid stats={stats} />

      <div className="rounded-xl border border-border bg-muted/30 p-4 grid grid-cols-3 gap-4 text-center">
        {[
          { label: "This Week", value: formatCurrency(weekRevenue) },
          { label: "This Month", value: formatCurrency(monthRevenue) },
          { label: "All Time", value: formatCurrency(totalRevenue) },
        ].map((r) => (
          <div key={r.label}>
            <p className="text-xs text-muted-foreground">{r.label}</p>
            <p className="text-base font-bold mt-0.5">{r.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <NeedsActionCard bookings={pending} />
        <UpcomingEventsCard bookings={upcoming} />
        <InventoryCard items={vendor.inventoryItems} />
        <PerformanceCard vendor={vendor} completedCount={completed.length} pendingCount={pending.length} />
      </div>
    </div>
  );
}

export default VendorDashboardPage;