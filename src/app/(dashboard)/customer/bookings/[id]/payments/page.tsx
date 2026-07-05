
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link   from "next/link";
import { Button } from "@/components/ui/button";
import { PaymentMilestoneCard } from "@/components/payments/payment-milestone-card";

type Payment = { id: string; milestone: string; amount: number; status: string; paidAt: string | null };
type BookingInfo = { id: string; agreedPrice: number | null; status: string };

export default function BookingPaymentsPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = params.id as string;

  const [booking,  setBooking]  = useState<BookingInfo | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading,  setLoading]  = useState(true);

  async function fetchData() {
    try {
      const [bRes, pRes] = await Promise.all([
        fetch(`/api/bookings/${id}`),
        fetch(`/api/payments?bookingId=${id}`),
      ]);
      const bData = await bRes.json() as { success: boolean; data?: Record<string, unknown> };
      const pData = await pRes.json() as { success: boolean; data?: Payment[] };

      if (bData.success && bData.data) {
        const d = bData.data;
        setBooking({ id: d.id as string, agreedPrice: d.agreedPrice as number | null, status: d.status as string });
      }
      if (pData.success && pData.data) setPayments(pData.data);
    } catch { /* silent */ }
    finally   { setLoading(false); }
  }

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );

  if (!booking?.agreedPrice) return (
    <div className="max-w-xl space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={`/customer/bookings/${id}`}><ArrowLeft className="size-4" /> Back</Link>
      </Button>
      <p className="text-muted-foreground text-sm">
        Payments will be available once the quote is accepted and booking is confirmed.
      </p>
    </div>
  );

  return (
    <div className="max-w-xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={`/customer/bookings/${id}`}><ArrowLeft className="size-4" /> Back to booking</Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          3-milestone payment schedule — 30% / 40% / 30%
        </p>
      </div>
      <PaymentMilestoneCard
        bookingId={booking.id}
        agreedPrice={booking.agreedPrice}
        payments={payments}
        onPaid={fetchData}
      />
    </div>
  );
}