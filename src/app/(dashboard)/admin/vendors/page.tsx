
// URL: /admin/vendors

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Building2, Star, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, VENDOR_CATEGORY_LABELS } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Vendors — Admin" };

const KYC_BADGE: Record<string, string> = {
  APPROVED:     "bg-green-50 text-green-700 border-green-200",
  PENDING:      "bg-amber-50 text-amber-700 border-amber-200",
  UNDER_REVIEW: "bg-blue-50 text-blue-700 border-blue-200",
  REJECTED:     "bg-red-50 text-red-700 border-red-200",
};

export default async function AdminVendorsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, 
      businessName: true, 
      category: true,
      city: true, 
      state: true, 
      kycStatus: true, 
      isVerified: true,
      isActive: true, 
      avgRating: true, 
      totalReviews: true,
      totalBookings: true, 
      commissionRate: true, 
      createdAt: true,
      user: { 
        select: { 
          name: true, 
          email: true, 
          phone: true 
        } 
      },
    },
  });

  type VendorRow = typeof vendors[number];

  const stats = {
    total:    vendors.length,
    approved: vendors.filter((v) => v.kycStatus === "APPROVED").length,
    pending:  vendors.filter((v) => v.kycStatus === "PENDING" || v.kycStatus === "UNDER_REVIEW").length,
    inactive: vendors.filter((v) => !v.isActive).length,
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All Vendors</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {stats.total} total · {stats.approved} approved · {stats.pending} pending · {stats.inactive} inactive
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Vendors", value: stats.total, color: "text-foreground"  },
          { label: "KYC Approved", value: stats.approved, color: "text-green-600" },
          { label: "Pending KYC", value: stats.pending,  color: "text-amber-600" },
          { label: "Inactive", value: stats.inactive, color: "text-red-600"  },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-5 text-center">
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vendors table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Vendor", "Category", "Location", "KYC", "Rating", "Bookings", "Joined", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(vendors as VendorRow[]).map((v) => (
                  <tr key={v.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                          {v.businessName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium truncate max-w-35">{v.businessName}</p>
                            {v.isVerified && <CheckCircle className="size-3.5 text-green-600 shrink-0" />}
                            {!v.isActive && <XCircle className="size-3.5 text-red-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-35">{v.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs">{VENDOR_CATEGORY_LABELS[v.category] ?? v.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{v.city}, {v.state}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${KYC_BADGE[v.kycStatus] ?? ""}`}>
                        {v.kycStatus === "UNDER_REVIEW" ? "Under Review" : v.kycStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {v.avgRating > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-medium">{v.avgRating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({v.totalReviews})</span>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium">{v.totalBookings}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{formatDate(v.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {(v.kycStatus === "PENDING" || v.kycStatus === "UNDER_REVIEW") && (
                        <Link href="/admin/kyc"
                          className="text-xs text-primary hover:underline font-medium">
                          Review KYC
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {vendors.length === 0 && (
              <div className="text-center py-16">
                <Building2 className="size-10 mx-auto text-muted-foreground opacity-30" />
                <p className="text-sm text-muted-foreground mt-3">No vendors yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}