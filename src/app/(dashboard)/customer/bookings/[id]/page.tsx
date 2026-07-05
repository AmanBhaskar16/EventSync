
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader,CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/shared/star-rating";
import { BookingStatusStepper } from "@/components/vendors/booking-status-stepper";
import { QuoteReview } from "@/components/bookings/quote-review";
import { MessageThread } from "@/components/bookings/message-thread";
import { formatDate, BOOKING_STATUS_LABELS } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/format";
import { getCustomerBookingDetail } from "./_queries";
import { InquiryPendingBanner, DisputeBanner } from "./_components/status-banner";
import { VendorSummaryCard } from "./_components/vendor-summary-card";
import { RequirementsCard } from "./_components/requirements-card";
import { PaymentsCard } from "./_components/payments-card";
import { ActionsCard } from "./_components/actions-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Booking Details" };

const STATUS_BADGE: Record<string, string> = {
  CONFIRMED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-muted text-muted-foreground",
  DISPUTED: "bg-red-50 text-red-700 border-red-200",
  COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
};

const CustomerBookingDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { id } = await params;

  const booking = await getCustomerBookingDetail(id, session.user.id, session.user.role);
  const { event, vendor, latestQuote, payments, review, dispute } = booking;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/customer/bookings"><ArrowLeft className="size-4" /> All bookings</Link>
        </Button>
        <Badge variant="outline" className={`text-xs px-2.5 py-1 ${STATUS_BADGE[booking.status] ?? "bg-primary/10 text-primary border-primary/30"}`}>
          {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
        </Badge>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
        <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><CalendarDays className="size-4" />{formatDate(event.eventDate)}</span>
          {event.city && <span className="flex items-center gap-1.5"><MapPin className="size-4" />{event.city}</span>}
          <span className="flex items-center gap-1.5"><Clock className="size-4" />Sent {formatDateTime(booking.createdAt)}</span>
        </div>
      </div>

      <BookingStatusStepper status={booking.status} />

      {booking.status === "INQUIRY" && (
        <InquiryPendingBanner vendorName={vendor.businessName} responseTime={vendor.responseTime} />
      )}

      {dispute && <DisputeBanner reason={dispute.reason} status={dispute.status} />}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <VendorSummaryCard vendor={vendor} />

          {booking.specialRequests && <RequirementsCard text={booking.specialRequests} />}

          {latestQuote ? (
            <QuoteReview bookingId={id} quote={latestQuote} />
          ) : booking.status === "INQUIRY" ? (
            <Card>
              <CardContent className="p-5 text-center text-muted-foreground">
                <p className="text-sm">No quote received yet. The vendor will send one soon.</p>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader className="pb-0"><CardTitle className="text-base">Messages</CardTitle></CardHeader>
            <MessageThread bookingId={id} />
          </Card>

          {review && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Your Review</CardTitle></CardHeader>
              <div className="px-6 pb-6 space-y-2">
                <StarRating rating={review.overallRating} size="md" />
                {review.comment && <p className="text-sm text-muted-foreground italic">&ldquo;{review.comment}&rdquo;</p>}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <PaymentsCard payments={payments} />
          <ActionsCard
            bookingId={id}
            status={booking.status}
            hasReview={!!review}
            hasDispute={!!dispute}
          />
        </div>
      </div>
    </div>
  );
}

export default CustomerBookingDetailPage;