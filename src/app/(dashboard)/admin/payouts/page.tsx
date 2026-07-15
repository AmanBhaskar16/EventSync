
// URL: /admin/payouts

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Banknote, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency, VENDOR_CATEGORY_LABELS } from "@/lib/utils";
import { PayoutActionButton } from "@/components/admin/payout-action-button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payouts — Admin" };

export default async function AdminPayoutsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  // Get all completed bookings with all payments paid — these need payout
  const completedBookings = await prisma.booking.findMany({
    where: { status: "COMPLETED" },
    select: {
      id: true, 
      agreedPrice: true, 
      commissionRate: true,
      vendorPayout: true, 
      completedAt: true,
      vendor: {
        select: {
          id: true, 
          businessName: true, 
          category: true,
          bankName: true, 
          bankAccountNo: true, 
          bankIfsc: true,
          commissionRate: true,
          user: { 
            select: { 
              name: true, 
              email: true 
            } 
          },
        },
      },
      payments: {
        select: { 
          status: true, 
          amount: true, 
          milestone: true, 
          paidAt: true 
        },
      },
      event: { select: { title: true } },
    },
    orderBy: { completedAt: "desc" },
  });

  type BookingRow = typeof completedBookings[number];

  // Calculate payout status for each booking
  const bookings = (completedBookings as BookingRow[]).map((b) => {
    const bv        = b as Record<string, unknown>;
    const vendor    = bv.vendor as Record<string, unknown>;
    const payments  = bv.payments as Array<{ status: string; amount: number; milestone: string; paidAt: Date | null }>;
    const allPaid   = payments.length === 3 && payments.every((p) => p.status === "PAID");
    const totalPaid = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
    const commRate  = (vendor.commissionRate as number) ?? 12;
    const commission = totalPaid * (commRate / 100);
    const payout    = totalPaid - commission;
    const hasBankDetails = !!(vendor.bankAccountNo && vendor.bankIfsc);

    return {
      id:           bv.id as string,
      agreedPrice:  bv.agreedPrice as number | null,
      vendorPayout: bv.vendorPayout as number | null,
      completedAt:  bv.completedAt as Date | null,
      eventTitle:   (bv.event as Record<string, unknown>).title as string,
      vendor: {
        id:           vendor.id as string,
        businessName: vendor.businessName as string,
        category:     vendor.category as string,
        bankName:     vendor.bankName as string | null,
        bankAccountNo:vendor.bankAccountNo as string | null,
        bankIfsc:     vendor.bankIfsc as string | null,
        commissionRate: commRate,
        user:         vendor.user as { name: string | null; email: string },
      },
      allPaid,
      totalPaid,
      commission,
      payout,
      hasBankDetails,
      isPaidOut: !!(bv.vendorPayout),
    };
  });

  const pendingPayouts   = bookings.filter((b) => b.allPaid && !b.isPaidOut);
  const completedPayouts = bookings.filter((b) => b.isPaidOut);
  const pendingAmount    = pendingPayouts.reduce((s, b) => s + b.payout, 0);
  const paidAmount       = completedPayouts.reduce((s, b) => s + (b.vendorPayout ?? 0), 0);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payouts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage vendor payouts for completed bookings.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending Payouts", value: formatCurrency(pendingAmount), icon: Clock, color: "text-amber-600"  },
          { label: "Paid Out", value: formatCurrency(paidAmount), icon: CheckCircle, color: "text-green-600"  },
          { label: "Pending Count", value: pendingPayouts.length, icon: Banknote, color: "text-primary"    },
          { label: "Completed Count", value: completedPayouts.length, icon: TrendingUp, color: "text-blue-600"   },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
                </div>
                <Icon className={`size-7 opacity-60 ${color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending payouts */}
      {pendingPayouts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="size-4 text-amber-600" />
              Pending Payouts
              <Badge variant="warning" className="text-[10px]">{pendingPayouts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingPayouts.map((b) => (
              <div key={b.id} className="rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{b.vendor.businessName}</p>
                      <span className="text-xs text-muted-foreground">
                        {VENDOR_CATEGORY_LABELS[b.vendor.category] ?? b.vendor.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{b.eventTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      Completed: {b.completedAt ? formatDate(b.completedAt) : "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-green-600">{formatCurrency(b.payout)}</p>
                    <p className="text-[10px] text-muted-foreground">after {b.vendor.commissionRate}% commission</p>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-3 gap-3 text-center text-xs bg-muted/50 rounded-lg p-3">
                  <div>
                    <p className="text-muted-foreground">Total Collected</p>
                    <p className="font-semibold mt-0.5">{formatCurrency(b.totalPaid)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Commission ({b.vendor.commissionRate}%)</p>
                    <p className="font-semibold mt-0.5 text-primary">- {formatCurrency(b.commission)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vendor Payout</p>
                    <p className="font-semibold mt-0.5 text-green-600">{formatCurrency(b.payout)}</p>
                  </div>
                </div>

                {/* Bank details */}
                {b.hasBankDetails ? (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 space-y-1 text-xs">
                    <p className="font-semibold text-blue-800">Bank Details</p>
                    <p className="text-blue-700">Bank: {b.vendor.bankName}</p>
                    <p className="text-blue-700">A/C: {b.vendor.bankAccountNo}</p>
                    <p className="text-blue-700">IFSC: {b.vendor.bankIfsc}</p>
                  </div>
                ) : (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <p className="text-xs text-amber-700 font-medium">
                      ⚠ Vendor has not added bank details yet
                    </p>
                  </div>
                )}

                <PayoutActionButton
                  bookingId={b.id}
                  vendorName={b.vendor.businessName}
                  amount={b.payout}
                  hasBankDetails={b.hasBankDetails}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {pendingPayouts.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <CheckCircle className="size-12 mx-auto text-green-500 opacity-60" />
          <p className="font-medium">All payouts complete!</p>
          <p className="text-sm text-muted-foreground">No pending payouts right now.</p>
        </div>
      )}

      {/* Completed payouts */}
      {completedPayouts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="size-4 text-green-600" />
              Completed Payouts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedPayouts.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm">{b.vendor.businessName}</p>
                  <p className="text-xs text-muted-foreground">{b.eventTitle} · {b.completedAt ? formatDate(b.completedAt) : "—"}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-green-600">{formatCurrency(b.vendorPayout ?? 0)}</span>
                  <Badge variant="success" className="text-[10px] gap-1">
                    <CheckCircle className="size-3" /> Paid
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}