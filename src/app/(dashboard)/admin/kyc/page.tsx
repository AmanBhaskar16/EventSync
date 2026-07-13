

import { auth }     from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma }   from "@/lib/db/prisma";
import { UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
// import { Badge }   from "@/components/ui/badge";
import { KYCReviewCard } from "@/components/admin/kyc-review-card";
// import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "KYC Review" };

const KYCReviewPage = async () => {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const vendors = await prisma.vendor.findMany({
    where:   { kycStatus: { in: ["PENDING", "UNDER_REVIEW"] } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, 
      businessName: true, 
      category: true,
      city: true, 
      state: true, 
      kycStatus: true,
      gstin: true, 
      pan: true, 
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

  const approved = await prisma.vendor.count({ where: { kycStatus: "APPROVED" } });
  const rejected = await prisma.vendor.count({ where: { kycStatus: "REJECTED" } });
  const LABELS = [
    { label: "Approved", value: approved, color: "text-green-600" },
    { label: "Pending Review", value: vendors.length, color: "text-amber-600" },
    { label: "Rejected", value: rejected, color: "text-red-600"   },
  ];

  type VendorRow = typeof vendors[number];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">KYC Review Queue</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {vendors.length} pending · {approved} approved · {rejected} rejected
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {LABELS.map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-5 text-center">
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {vendors.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <UserCheck className="size-12 mx-auto text-green-500 opacity-60" />
          <p className="font-medium text-lg">All clear!</p>
          <p className="text-sm text-muted-foreground">No pending KYC applications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(vendors as VendorRow[]).map((vendor) => (
            <KYCReviewCard
              key={vendor.id}
              vendor={{
                id:           vendor.id,
                businessName: vendor.businessName,
                category:     vendor.category,
                city:         vendor.city,
                state:        vendor.state,
                kycStatus:    vendor.kycStatus,
                gstin:        vendor.gstin,
                pan:          vendor.pan,
                createdAt:    vendor.createdAt,
                user:         vendor.user,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default KYCReviewPage;