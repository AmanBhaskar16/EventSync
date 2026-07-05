
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, Building2, TrendingUp, AlertCircle, UserCheck, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { StatGrid } from "@/components/dashboard/stat-card";
import { getAdminDashboardData } from "./_queries";
import { AlertBanners } from "./_components/alert-banners";
import { KycQueueCard } from "./_components/kyc-queue-card";
import { DisputesCard } from "./_components/disputes-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

const AdminDashboardPage = async () => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = await getAdminDashboardData();

  const stats = [
    { label: "Total GMV", value: formatCurrency(data.totalGMV), icon: TrendingUp, color: "text-primary", href: "/admin/analytics" },
    { label: "Total Vendors", value: data.totalVendors, icon: Building2, color: "text-blue-600", href: "/admin/vendors" },
    { label: "Customers", value: data.totalCustomers, icon: Users, color: "text-purple-600", href: "/admin/customers" },
    { label: "Total Bookings", value: data.totalBookings, icon: CreditCard, color: "text-green-600", href: "/admin/bookings" },
    { label: "Pending KYC", value: data.pendingKYC, icon: UserCheck, color: "text-amber-600", href: "/admin/kyc" },
    { label: "Open Disputes", value: data.activeDisputes, icon: AlertCircle, color: "text-red-600", href: "/admin/disputes" },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform-wide overview and moderation queue.</p>
      </div>

      <StatGrid stats={stats} columns={3}/>
      <AlertBanners pendingKYC={data.pendingKYC} activeDisputes={data.activeDisputes} />

      <div className="grid lg:grid-cols-2 gap-6">
        <KycQueueCard vendors={data.pendingVendors} />
        <DisputesCard disputes={data.openDisputes} />
      </div>
    </div>
  );
}

export default AdminDashboardPage;