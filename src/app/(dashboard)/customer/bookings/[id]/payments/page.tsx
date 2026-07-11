
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PaymentMilestoneCard } from "@/components/payments/payment-milestone-card";

type BookingInfo = {
  id: string; 
  agreedPrice: number | null; 
  status: string;
  event: { 
    eventDate: string; 
    title: string; 
    city: string | null 
  };
};

export default function BookingPaymentsPage() {
  const params  = useParams();
  const id = params.id as string;
  const [booking,setBooking]  = useState<BookingInfo | null>(null);
  const [loading,setLoading]  = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res  = await fetch(`/api/bookings/${id}`);

        const data = await res.json() as { 
          success: boolean; 
          data?: Record<string, unknown> 
        };

        if (data.success && data.data) {
          const d     = data.data;
          const event = d.event as { 
            eventDate: string; 
            title: string; 
            city: string | null 
          };
          setBooking({
            id: d.id as string,
            agreedPrice: d.agreedPrice as number | null,
            status: d.status as string,
            event: {
              eventDate: event.eventDate ?? "",
              title: event.title ?? "",
              city: event.city ?? null,
            },
          });
        }
      } catch { /* silent */ }
      finally   { setLoading(false); }
    }
    fetchData();
  }, [id]);

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
        <Link href={`/customer/bookings/${id}`}>
          <ArrowLeft className="size-4" /> Back to booking
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          3-milestone payment schedule — 30% / 40% / 30%
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {booking.event.title}{booking.event.city ? ` · ${booking.event.city}` : ""}
        </p>
      </div>
      <PaymentMilestoneCard
        bookingId={booking.id}
        agreedPrice={booking.agreedPrice}
        eventDate={booking.event.eventDate}
      />
    </div>
  );
}