
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Users, CreditCard, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGreeting, formatCurrency } from "@/lib/utils";
import { StatGrid } from "@/components/dashboard/stat-card";
import { getCustomerDashboardData } from "./_queries";
import { UpcomingEventsCard } from "./_components/upcoming-events-card";
import { RecentBookingsCard } from "./_components/recent-bookings-card";
import { PastEventsCard } from "./_components/past-events-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

const CustomerDashboardPage = async () => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = await getCustomerDashboardData(session.user.id);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Customer profile not found.</p>
          <Button asChild variant="outline"><Link href="/">Go home</Link></Button>
        </div>
      </div>
    );
  }

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  const stats = [
    { label: "Total Events", value: data.events.length, icon: CalendarDays, color: "text-primary" },
    { label: "Upcoming", value: data.upcoming.length, icon: TrendingUp, color: "text-blue-600" },
    { label: "Total Bookings", value: data.totalBookings, icon: Users, color: "text-purple-600" },
    { label: "Total Spent", value: formatCurrency(data.spent), icon: CreditCard, color: "text-green-600" },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Good {getGreeting()}, {firstName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your events.</p>
        </div>
        <Button asChild><Link href="/customer/events/new"><Plus className="size-4" /> New Event</Link></Button>
      </div>

      <StatGrid stats={stats} />

      <div className="grid lg:grid-cols-2 gap-6">
        <UpcomingEventsCard events={data.upcoming} />
        <RecentBookingsCard bookings={data.bookings} />
      </div>

      <PastEventsCard events={data.past} />
    </div>
  );
}

export default CustomerDashboardPage;