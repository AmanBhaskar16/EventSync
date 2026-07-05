import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingStatusStepper } from "@/components/vendors/booking-status-stepper";
import { QuoteBuilder } from "@/components/bookings/quote-builder";
import { MessageThread } from "@/components/bookings/message-thread";
import { formatDate, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/format";
import { getVendorBookingDetail } from "./_queries";
import { CustomerInfoCard } from "./_components/customer-info-card";
import { QuoteHistoryCard } from "./_components/quote-history-card";
import { EventDetailsCard } from "./_components/event-details-card";
import { PaymentsCard } from "./_components/payments-card";
import { ActionsCard } from "./_components/actions-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Booking Detail" };

const VendorBookingDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { id } = await params;

  const booking = await getVendorBookingDetail(id, session.user.id, session.user.role);
  const { event, quotes, latestQuote, payments, canSendQuote } = booking;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/vendor/bookings"><ArrowLeft className="size-4" /> All bookings</Link>
        </Button>
        <Badge variant="outline" className={`text-xs px-2.5 py-1 ${BOOKING_STATUS_COLORS[booking.status] ?? ""}`}>
          {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
        </Badge>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
        <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><CalendarDays className="size-4" />{formatDate(event.eventDate)}</span>
          {event.city && <span className="flex items-center gap-1.5"><MapPin className="size-4" />{event.city}</span>}
          {event.guestCount && <span className="flex items-center gap-1.5"><Users className="size-4" />{event.guestCount} guests</span>}
          <span className="flex items-center gap-1.5"><Clock className="size-4" />Received {formatDateTime(booking.createdAt)}</span>
        </div>
      </div>

      <BookingStatusStepper status={booking.status} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CustomerInfoCard
            customer={event.customer}
            description={event.description}
            specialRequests={booking.specialRequests}
          />

          {canSendQuote ? (
            <QuoteBuilder bookingId={id} />
          ) : latestQuote ? (
            <QuoteHistoryCard quotes={quotes} isNegotiating={booking.status === "NEGOTIATION"} />
          ) : null}

          <Card>
            <CardHeader className="pb-0"><CardTitle className="text-base">Messages</CardTitle></CardHeader>
            <MessageThread bookingId={id} />
          </Card>
        </div>

        <div className="space-y-4">
          <EventDetailsCard event={event} />
          <PaymentsCard payments={payments} />
          <ActionsCard status={booking.status} />
        </div>
      </div>
    </div>
  );
}

export default VendorBookingDetailPage;