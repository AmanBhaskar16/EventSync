
// URL: /customer/bookings/[id]
// Booking detail — redirect target after inquiry sent

import { auth }     from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma }   from "@/lib/db/prisma";
import Link         from "next/link";
import {
  ArrowLeft, CalendarDays, MapPin, Clock,
  CheckCircle, AlertCircle, CreditCard, MessageSquare,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge }    from "@/components/ui/badge";
import { StarRating } from "@/components/shared/star-rating";
import { BookingStatusStepper } from "@/components/vendors/booking-status-stepper";
import {
  formatCurrency, formatDate, BOOKING_STATUS_LABELS, VENDOR_CATEGORY_LABELS,
} from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/format";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Booking Details" };

const MILESTONE_LABELS: Record<string, string> = {
  BOOKING_CONFIRMATION: "Booking Confirmation (30%)",
  PRE_EVENT:            "Pre-Event Payment (40%)",
  POST_EVENT:           "Post-Event Settlement (30%)",
};

export default async function CustomerBookingDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    select: {
      id: true, status: true, agreedPrice: true, specialRequests: true,
      guestCount: true, createdAt: true, confirmedAt: true, cancelReason: true,
      event: {
        select: {
          id: true, title: true, type: true, eventDate: true, city: true, guestCount: true,
          customer: { select: { user: { select: { id: true, name: true } } } },
        },
      },
      vendor: {
        select: {
          id: true, businessName: true, category: true, city: true, state: true,
          avgRating: true, responseTime: true, isVerified: true,
          user: { select: { id: true } },
        },
      },
      payments: {
        select: { id: true, milestone: true, amount: true, status: true, paidAt: true },
        orderBy: { createdAt: "asc" },
      },
      review: { select: { id: true, overallRating: true, comment: true } },
      dispute: { select: { id: true, reason: true, status: true } },
    },
  });

  if (!booking) notFound();

  // Access control — only the customer of this event can view
  const b        = booking as Record<string, unknown>;
  const event    = b.event    as Record<string, unknown>;
  const customer = event.customer as Record<string, unknown>;
  const custUser = customer.user  as Record<string, unknown>;
  if (session.user.id !== custUser.id && session.user.role !== "ADMIN") {
    redirect("/customer/dashboard");
  }

  const vendor   = b.vendor   as { id:string; businessName:string; category:string; city:string; state:string; avgRating:number; responseTime:number; isVerified:boolean };
  const payments = (b.payments as Array<{ id:string; milestone:string; amount:number; status:string; paidAt:Date|null }>);
  const review   = b.review   as { id:string; overallRating:number; comment:string|null } | null;
  const dispute  = b.dispute  as { id:string; reason:string; status:string } | null;

  const STATUS_BADGE_COLOR: Record<string, string> = {
    CONFIRMED:   "bg-green-50 text-green-700 border-green-200",
    CANCELLED:   "bg-muted text-muted-foreground",
    DISPUTED:    "bg-red-50 text-red-700 border-red-200",
    COMPLETED:   "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/customer/bookings"><ArrowLeft className="size-4" /> All bookings</Link>
        </Button>
        <Badge variant="outline" className={`text-xs px-2.5 py-1 ${STATUS_BADGE_COLOR[booking.status] ?? "bg-primary/10 text-primary border-primary/30"}`}>
          {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
        </Badge>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{(event as { title: string }).title}</h1>
        <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><CalendarDays className="size-4" />{formatDate((event as { eventDate: Date }).eventDate)}</span>
          {(event as { city: string | null }).city && (
            <span className="flex items-center gap-1.5"><MapPin className="size-4" />{(event as { city: string }).city}</span>
          )}
          {booking.guestCount && (
            <span className="flex items-center gap-1.5"><CheckCircle className="size-4" />{booking.guestCount} guests</span>
          )}
          <span className="flex items-center gap-1.5"><Clock className="size-4" />Sent {formatDateTime(booking.createdAt)}</span>
        </div>
      </div>

      {/* Status stepper */}
      <BookingStatusStepper status={booking.status} />

      {/* Alerts */}
      {booking.status === "INQUIRY" && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
          <Clock className="size-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Inquiry sent — awaiting vendor response</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {vendor.businessName} typically responds within {vendor.responseTime} hours.
            </p>
          </div>
        </div>
      )}
      {dispute && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-900">Dispute raised — {dispute.status}</p>
            <p className="text-xs text-red-700 mt-0.5">{dispute.reason}</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Vendor */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Vendor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                  {vendor.businessName.charAt(0)}
                </div>
                <div className="min-w-0 space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{vendor.businessName}</p>
                    {vendor.isVerified && (
                      <span className="text-[11px] font-semibold text-green-600 flex items-center gap-1">
                        <CheckCircle className="size-3" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {VENDOR_CATEGORY_LABELS[vendor.category] ?? vendor.category} · {vendor.city}, {vendor.state}
                  </p>
                  {vendor.avgRating > 0 && <StarRating rating={vendor.avgRating} size="sm" />}
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/vendors/${vendor.id}`}>View profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Special requests */}
          {booking.specialRequests && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="size-4 text-muted-foreground" /> Your requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{booking.specialRequests}</p>
              </CardContent>
            </Card>
          )}

          {/* Review */}
          {review && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <StarRating rating={review.overallRating} size="md" />
                {review.comment && <p className="text-sm text-muted-foreground italic">&ldquo;{review.comment}&rdquo;</p>}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: payments + actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="size-4 text-muted-foreground" /> Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {payments.length === 0 ? (
                <p className="text-xs text-muted-foreground">Payment schedule will appear once the quote is accepted.</p>
              ) : (
                payments.map((p) => (
                  <div key={p.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{MILESTONE_LABELS[p.milestone] ?? p.milestone}</span>
                      <Badge variant={p.status === "PAID" ? "success" : p.status === "FAILED" ? "destructive" : "warning"} className="text-[10px]">
                        {p.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{formatCurrency(p.amount)}</span>
                      {p.paidAt && <span className="text-[10px] text-muted-foreground">{formatDate(p.paidAt)}</span>}
                    </div>
                    {p.status === "PENDING" && (
                      <Button size="sm" className="w-full mt-1 h-8 text-xs">Pay now</Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {!["CANCELLED","COMPLETED","DISPUTED"].includes(booking.status) && (
                <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                  Cancel booking
                </Button>
              )}
              {booking.status === "COMPLETED" && !review && (
                <Button size="sm" className="w-full" asChild>
                  <Link href={`/customer/bookings/${id}/review`}>Leave a review</Link>
                </Button>
              )}
              {booking.status === "COMPLETED" && !dispute && (
                <Button variant="outline" size="sm" className="w-full">Raise a dispute</Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}