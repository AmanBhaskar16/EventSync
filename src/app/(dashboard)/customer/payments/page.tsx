
// Shows all payments across all bookings for the customer

"use client";

import { useState, useEffect } from "react";
import { Loader2, CreditCard, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge }  from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

type Payment = {
  id: string; 
  milestone: string; 
  amount: number;
  status: string; 
  paidAt: string | null;
  booking: {
    id: string; 
    agreedPrice: number | null;
    event:  { 
        title: string; 
        eventDate: string 
    };
    vendor: { businessName: string };
  };
};

const MILESTONE_LABELS: Record<string, string> = {
  BOOKING_CONFIRMATION: "Booking Confirmation (30%)",
  PRE_EVENT:  "Pre-Event Payment (40%)",
  POST_EVENT:  "Post-Event Settlement (30%)",
};

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary"; icon: React.ElementType }> = {
  PAID:       { label: "Paid",       variant: "success",     icon: CheckCircle  },
  PENDING:    { label: "Pending",    variant: "warning",     icon: Clock        },
  PROCESSING: { label: "Processing", variant: "warning",     icon: Clock        },
  FAILED:     { label: "Failed",     variant: "destructive", icon: AlertCircle  },
};

export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch("/api/payments/customer")
      .then((r) => r.json() as Promise<{ success: boolean; data?: Payment[] }>)
      .then((data) => { if (data.success && data.data) setPayments(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalPaid    = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amount, 0);
  const paidCount    = payments.filter((p) => p.status === "PAID").length;
  const pendingCount = payments.filter((p) => p.status === "PENDING").length;

  // Group by booking
  const byBooking = payments.reduce<Record<string, { bookingId: string; eventTitle: string; eventDate: string; vendorName: string; payments: Payment[] }>>(
    (acc, p) => {
      const bId = p.booking.id;
      if (!acc[bId]) {
        acc[bId] = {
          bookingId:  bId,
          eventTitle: p.booking.event.title,
          eventDate:  p.booking.event.eventDate,
          vendorName: p.booking.vendor.businessName,
          payments:   [],
        };
      }
      acc[bId].payments.push(p);
      return acc;
    },
    {}
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track all your payments across bookings.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Paid",     value: formatCurrency(totalPaid),    color: "text-green-600", icon: CheckCircle },
          { label: "Pending",        value: formatCurrency(totalPending),  color: "text-amber-600", icon: Clock       },
          { label: "Paid Count",     value: `${paidCount} payments`,       color: "text-primary",   icon: CreditCard  },
          { label: "Pending Count",  value: `${pendingCount} payments`,    color: "text-amber-600", icon: Clock       },
        ].map(({ label, value, color, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-lg font-bold mt-1 ${color}`}>{value}</p>
                </div>
                <Icon className={`size-6 opacity-50 ${color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment list grouped by booking */}
      {Object.keys(byBooking).length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <CreditCard className="size-12 mx-auto text-muted-foreground opacity-30" />
          <p className="font-medium text-lg">No payments yet</p>
          <p className="text-sm text-muted-foreground">
            Payments will appear here once you confirm a booking.
          </p>
          <Button asChild>
            <Link href="/vendors">Find a vendor</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.values(byBooking).map((group) => {
            const groupPaid    = group.payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
            const groupPending = group.payments.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amount, 0);
            const allPaid      = group.payments.every((p) => p.status === "PAID");

            return (
              <Card key={group.bookingId}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-sm">{group.eventTitle}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {group.vendorName} · Event: {formatDate(group.eventDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {allPaid ? (
                        <Badge variant="success" className="text-[10px]">All paid</Badge>
                      ) : (
                        <Button size="sm" asChild>
                          <Link href={`/customer/bookings/${group.bookingId}/payments`}>
                            Pay now
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {group.payments.map((p) => {
                    const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.PENDING;
                    const Icon = cfg.icon;
                    return (
                      <div key={p.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium">
                            {MILESTONE_LABELS[p.milestone] ?? p.milestone}
                          </p>
                          {p.paidAt && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Paid on {formatDate(p.paidAt)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-sm font-semibold ${p.status === "PAID" ? "text-green-600" : "text-muted-foreground"}`}>
                            {formatCurrency(p.amount)}
                          </span>
                          <Badge variant={cfg.variant} className="text-[10px] gap-1">
                            <Icon className="size-3" /> {cfg.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}

                  {/* Summary */}
                  {(groupPaid > 0 || groupPending > 0) && (
                    <div className="rounded-lg bg-muted/50 p-3 flex justify-between text-xs mt-2">
                      <span className="text-muted-foreground">
                        Paid: <span className="text-green-600 font-semibold">{formatCurrency(groupPaid)}</span>
                      </span>
                      {groupPending > 0 && (
                        <span className="text-muted-foreground">
                          Pending: <span className="text-amber-600 font-semibold">{formatCurrency(groupPending)}</span>
                        </span>
                      )}
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