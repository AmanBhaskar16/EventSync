
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TrendingUp, Users, Building2, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { getAnalyticsData } from "./_queries";
import { RevenueGrowthCard } from "./_components/revenue-growth-card";
import { PlatformHealthCard }  from "./_components/platform-health-card";
import { TopVendorsCard } from "./_components/top-vendors-card";
import { RecentBookingsCard }  from "./_components/recent-bookings-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics" };

const AdminAnalyticsPage = async () => {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const data = await getAnalyticsData();

  const statCards = [
    { label: "Total GMV", value: formatCurrency(data.gmv), icon: CreditCard, color: "text-primary"    },
    { label: "This Month GMV", value: formatCurrency(data.mGMV), icon: TrendingUp, color: "text-blue-600"   },
    { label: "Total Vendors", value: data.approvedVendors, icon: Building2, color: "text-green-600"  },
    { label: "Customers", value: data.totalCustomers, icon: Users, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time platform overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
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

      <div className="grid lg:grid-cols-3 gap-6">
        <RevenueGrowthCard
          gmv={data.gmv}
          mGMV={data.mGMV}
          lmGMV={data.lmGMV}
          growth={data.growth}
          isUp={data.isUp}
        />
        <PlatformHealthCard
          totalBookings={data.totalBookings}
          activeBookings={data.activeBookings}
          pendingKYC={data.pendingKYC}
          openDisputes={data.openDisputes}
          totalReviews={data.totalReviews}
        />
        <TopVendorsCard vendors={data.topVendors} />
      </div>

      <RecentBookingsCard bookings={data.recentBookings} />
    </div>
  );
}

export default AdminAnalyticsPage;