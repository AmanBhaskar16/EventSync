
// Vendor earnings overview — total received, pending, commission breakdown

import { auth }     from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma }   from "@/lib/db/prisma";
import {
  TrendingUp, Banknote, Clock, CheckCircle, AlertCircle, BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge }   from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Finances" };

const MILESTONE_LABELS: Record<string, string> = {
  BOOKING_CONFIRMATION: "Booking Confirmation (30%)",
  PRE_EVENT: "Pre-Event Payment (40%)",
  POST_EVENT: "Post-Event Settlement (30%)",
};

export default async function VendorFinancesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const vendor = await prisma.vendor.findUnique({
    where:  { userId: session.user.id },
    select: { 
      id: true, 
      commissionRate: true, 
      bankName: true, 
      bankAccountNo: true 
    },
  });
  if (!vendor) redirect("/vendor/dashboard");

  const v = vendor as { 
    id: string; 
    commissionRate: number; 
    bankName: string | null; 
    bankAccountNo: string | null 
  };

  const payments = await prisma.payment.findMany({
    where: {
      booking: { vendorId: v.id },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, 
      milestone: true, 
      amount: true, 
      status: true, 
      paidAt: true,
      booking: {
        select: {
          id: true, 
          agreedPrice: true, 
          vendorPayout: true,
          event: { 
            select: { 
              title: true, 
              eventDate: true 
            } 
          },
        },
      },
    },
  });

  type PaymentRow = typeof payments[number];

  const paid    = (payments as PaymentRow[]).filter((p) => p.status === "PAID");
  const pending = (payments as PaymentRow[]).filter((p) => p.status === "PENDING");

  const totalReceived   = paid.reduce((s, p) => s + p.amount, 0);
  const totalPending    = pending.reduce((s, p) => s + p.amount, 0);
  const commissionRate  = v.commissionRate ?? 12;
  const commissionPaid  = totalReceived * (commissionRate / 100);
  const netEarnings     = totalReceived - commissionPaid;

  const LABELS = [
    { label: "Total Received", value: formatCurrency(totalReceived), icon: CheckCircle, color: "text-green-600" },
    { label: "Net Earnings", value: formatCurrency(netEarnings), icon: TrendingUp, color: "text-primary" },
    { label: "Pending", value: formatCurrency(totalPending), icon: Clock, color: "text-amber-600"  },
    { label: "Platform Fee", value: formatCurrency(commissionPaid),icon: Banknote, color: "text-red-500" },
  ];

  // Group payments by booking
  const byBooking = new Map<string, { title: string; eventDate: Date; payments: PaymentRow[] }>();
  for (const p of payments as PaymentRow[]) {
    const pv  = p as Record<string, unknown>;
    const booking = pv.booking as Record<string, unknown>;
    const event = booking.event as { title: string; eventDate: Date };
    const bId  = booking.id as string;
    if (!byBooking.has(bId)) {
      byBooking.set(bId, { title: event.title, eventDate: event.eventDate, payments: [] });
    }
    byBooking.get(bId)!.payments.push(p);
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finances</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your earnings overview and payment history.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {LABELS.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
                </div>
                <Icon className={`size-7 opacity-50 ${color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Commission info */}
      <Card>
        <CardContent className="p-5 flex items-start gap-4">
          <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold">Platform Commission: {commissionRate}%</p>
            <p className="text-xs text-muted-foreground">
              EventSync charges {commissionRate}% on all payments received.
              Net earnings = Total received − {commissionRate}% commission.
            </p>
            {v.bankAccountNo ? (
              <p className="text-xs text-green-600 font-medium">
                ✓ Bank details added — payouts will be transferred to {v.bankName}
              </p>
            ) : (
              <p className="text-xs text-red-500 font-medium">
                ⚠ Add bank details in Settings to receive payouts
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment history by booking */}
      {byBooking.size === 0 ? (
        <div className="text-center py-16 space-y-3">
          <BarChart3 className="size-12 mx-auto text-muted-foreground opacity-30" />
          <p className="font-medium">No payments yet</p>
          <p className="text-sm text-muted-foreground">
            Payment history will appear here once customers start paying.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-base font-semibold">Payment History</h2>
          {Array.from(byBooking.entries()).map(([bookingId, data]) => {
            const bookingTotal = data.payments
              .filter((p) => p.status === "PAID")
              .reduce((s, p) => s + p.amount, 0);
            const commission = bookingTotal * (commissionRate / 100);
            const net = bookingTotal - commission;

            return (
              <Card key={bookingId}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-sm">{data.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Event: {formatDate(data.eventDate)}
                      </p>
                    </div>
                    {bookingTotal > 0 && (
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">Net earned</p>
                        <p className="font-bold text-green-600">{formatCurrency(net)}</p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {data.payments.map((payment) => {
                    const isPaid = payment.status === "PAID";
                    return (
                      <div key={payment.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium">
                            {MILESTONE_LABELS[payment.milestone] ?? payment.milestone}
                          </p>
                          {isPaid && payment.paidAt && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Received: {formatDate(payment.paidAt)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-sm font-semibold ${isPaid ? "text-green-600" : "text-muted-foreground"}`}>
                            {formatCurrency(payment.amount)}
                          </span>
                          <Badge
                            variant={isPaid ? "success" : payment.status === "FAILED" ? "destructive" : "warning"}
                            className="text-[10px]"
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}

                  {bookingTotal > 0 && (
                    <div className="rounded-lg bg-muted/50 p-3 mt-2">
                      <div className="grid grid-cols-3 gap-3 text-center text-xs">
                        <div>
                          <p className="text-muted-foreground">Received</p>
                          <p className="font-semibold mt-0.5">{formatCurrency(bookingTotal)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Commission ({commissionRate}%)</p>
                          <p className="font-semibold mt-0.5 text-red-500">-{formatCurrency(commission)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Net</p>
                          <p className="font-semibold mt-0.5 text-green-600">{formatCurrency(net)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}