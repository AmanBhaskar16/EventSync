// // src/app/(dashboard)/customer/bookings/[id]/page.tsx
// import { auth } from "@/lib/auth";
// import { redirect, notFound } from "next/navigation";
// import { prisma } from "@/lib/db/prisma";
// import Link from "next/link";
// import { ArrowLeft, CalendarDays, MapPin, Clock, CheckCircle, AlertCircle, CreditCard } from "lucide-react";
// import { Button }  from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { StarRating } from "@/components/shared/star-rating";
// import { BookingStatusStepper } from "@/components/vendors/booking-status-stepper";
// import { QuoteReview } from "@/components/bookings/quote-review";
// import { MessageThread } from "@/components/bookings/message-thread";
// import { CustomerActionButtons } from "@/components/bookings/customer-action-buttons";
// import {
//   formatCurrency, formatDate,
//   BOOKING_STATUS_LABELS, VENDOR_CATEGORY_LABELS,
// } from "@/lib/utils";
// import { formatDateTime } from "@/lib/utils/format";
// import type { Metadata } from "next";

// export const metadata: Metadata = { title: "Booking Details" };

// const MILESTONE_LABELS: Record<string, string> = {
//   BOOKING_CONFIRMATION: "Booking Confirmation (30%)",
//   PRE_EVENT: "Pre-Event Payment (40%)",
//   POST_EVENT: "Post-Event Settlement (30%)",
// };

// const STATUS_BADGE: Record<string, string> = {
//   CONFIRMED: "bg-green-50 text-green-700 border-green-200",
//   CANCELLED: "bg-muted text-muted-foreground",
//   DISPUTED: "bg-red-50 text-red-700 border-red-200",
//   COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
// };

// type QuoteData = {
//   id: string; 
//   version: number; 
//   status: string;
//   lineItems: Array<{ 
//     description: string; 
//     quantity: number; 
//     unitPrice: number; 
//     total: number 
//   }>;
//   subtotal: number; 
//   gstRate: number; 
//   gstAmount: number;
//   totalAmount: number; 
//   validUntil: string; 
//   notes: string | null; 
//   terms: string | null;
// };

// type PaymentRow = { 
//   id: string; 
//   milestone: string; 
//   amount: number; 
//   status: string; 
//   paidAt: Date | null 
// };

// type VendorInfo = { 
//   id: string; 
//   businessName: string; 
//   category: string; 
//   city: string; 
//   state: string; 
//   avgRating: number; 
//   responseTime: number; 
//   isVerified: boolean 
// };

// type BookingDetail = {
//   id: string; 
//   status: string; 
//   agreedPrice: number | null; 
//   specialRequests: string | null;
//   guestCount: number | null; 
//   createdAt: Date; 
//   confirmedAt: Date | null; 
//   cancelReason: string | null;
//   event: { 
//     id: string; 
//     title: string; 
//     type: string; 
//     eventDate: Date; 
//     city: string | null; 
//     customer: { 
//       user: { 
//         id: string; 
//         name: string | null 
//       } 
//     } 
//   };
//   vendor: VendorInfo;
//   quotes: QuoteData[];
//   payments: PaymentRow[];
//   review: { 
//     id: string; 
//     overallRating: number; 
//     comment: string | null 
//   } | null;
//   dispute: { 
//     id: string; 
//     reason: string; 
//     status: string 
//   } | null;
// };

// export default async function CustomerBookingDetailPage(
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const session = await auth();
//   if (!session?.user) redirect("/login");
//   const { id } = await params;

//   const raw = await prisma.booking.findUnique({
//     where: { id },
//     select: {
//       id: true, 
//       status: true, 
//       agreedPrice: true, 
//       specialRequests: true,
//       guestCount: true, 
//       createdAt: true, 
//       confirmedAt: true, 
//       cancelReason: true,
//       event: {
//         select: {
//           id: true, 
//           title: true, 
//           type: true, 
//           eventDate: true, 
//           city: true,
//           customer: { 
//             select: { 
//               user: { 
//                 select: { 
//                   id: true, 
//                   name: true 
//                 } 
//               } 
//             } 
//           },
//         },
//       },
//       vendor: {
//         select: {
//           id: true, 
//           businessName: true, 
//           category: true, 
//           city: true, 
//           state: true,
//           avgRating: true, 
//           responseTime: true, 
//           isVerified: true,
//         },
//       },
//       quotes: {
//         orderBy: { version: "desc" },
//         select: {
//           id: true, 
//           version: true, 
//           status: true, 
//           lineItems: true,
//           subtotal: true, 
//           gstRate: true, 
//           gstAmount: true,
//           totalAmount: true, 
//           validUntil: true, 
//           notes: true, 
//           terms: true,
//         },
//       },
//       payments: {
//         orderBy: { createdAt: "asc" },
//         select: { 
//           id: true, 
//           milestone: true, 
//           amount: true, 
//           status: true, 
//           paidAt: true 
//         },
//       },
//       review:  { 
//         select: { 
//           id: true, 
//           overallRating: true, 
//           comment: true 
//         } 
//       },
//       dispute: { 
//         select: { 
//           id: true, 
//           reason: true, 
//           status: true 
//         } 
//       },
//     },
//   });

//   if (!raw) notFound();
//   const booking = raw as unknown as BookingDetail;

//   if (session.user.id !== booking.event.customer.user.id && session.user.role !== "ADMIN") {
//     redirect("/customer/dashboard");
//   }

//   const latestQuote = booking.quotes[0] ?? null;

//   return (
//     <div className="space-y-6 max-w-5xl">

//       <div className="flex items-start justify-between gap-4">
//         <Button variant="ghost" size="sm" asChild className="-ml-2">
//           <Link href="/customer/bookings"><ArrowLeft className="size-4" /> All bookings</Link>
//         </Button>
//         <Badge variant="outline" className={`text-xs px-2.5 py-1 ${STATUS_BADGE[booking.status] ?? "bg-primary/10 text-primary border-primary/30"}`}>
//           {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
//         </Badge>
//       </div>

//       <div>
//         <h1 className="text-2xl font-bold tracking-tight">{booking.event.title}</h1>
//         <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
//           <span className="flex items-center gap-1.5"><CalendarDays className="size-4" />{formatDate(booking.event.eventDate)}</span>
//           {booking.event.city && <span className="flex items-center gap-1.5"><MapPin className="size-4" />{booking.event.city}</span>}
//           <span className="flex items-center gap-1.5"><Clock className="size-4" />Sent {formatDateTime(booking.createdAt)}</span>
//         </div>
//       </div>

//       <BookingStatusStepper status={booking.status} />

//       {booking.status === "INQUIRY" && (
//         <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
//           <Clock className="size-5 text-primary mt-0.5 shrink-0" />
//           <div>
//             <p className="text-sm font-semibold">Inquiry sent — awaiting vendor response</p>
//             <p className="text-xs text-muted-foreground mt-0.5">{booking.vendor.businessName} typically responds within {booking.vendor.responseTime} hours.</p>
//           </div>
//         </div>
//       )}

//       {booking.dispute && (
//         <div className="rounded-xl border border-red-300 bg-red-50 p-4 flex items-start gap-3">
//           <AlertCircle className="size-5 text-red-600 mt-0.5 shrink-0" />
//           <div>
//             <p className="text-sm font-semibold text-red-900">Dispute raised — {booking.dispute.status}</p>
//             <p className="text-xs text-red-700 mt-0.5">{booking.dispute.reason}</p>
//           </div>
//         </div>
//       )}

//       <div className="grid lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 space-y-6">

//           {/* Vendor */}
//           <Card>
//             <CardHeader className="pb-3"><CardTitle className="text-base">Vendor</CardTitle></CardHeader>
//             <CardContent>
//               <div className="flex items-start gap-4">
//                 <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
//                   {booking.vendor.businessName.charAt(0)}
//                 </div>
//                 <div className="min-w-0 space-y-1 flex-1">
//                   <div className="flex items-center gap-2 flex-wrap">
//                     <p className="font-semibold">{booking.vendor.businessName}</p>
//                     {booking.vendor.isVerified && (
//                       <span className="text-[11px] font-semibold text-green-600 flex items-center gap-1">
//                         <CheckCircle className="size-3" /> Verified
//                       </span>
//                     )}
//                   </div>
//                   <p className="text-sm text-muted-foreground">
//                     {VENDOR_CATEGORY_LABELS[booking.vendor.category] ?? booking.vendor.category} &middot; {booking.vendor.city}, {booking.vendor.state}
//                   </p>
//                   {booking.vendor.avgRating > 0 && <StarRating rating={booking.vendor.avgRating} size="sm" />}
//                 </div>
//                 <Button variant="outline" size="sm" asChild>
//                   <Link href={`/vendors/${booking.vendor.id}`}>View profile</Link>
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>

//           {booking.specialRequests && (
//             <Card>
//               <CardHeader className="pb-3"><CardTitle className="text-base">Your Requirements</CardTitle></CardHeader>
//               <CardContent>
//                 <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{booking.specialRequests}</p>
//               </CardContent>
//             </Card>
//           )}

//           {latestQuote ? (
//             <QuoteReview bookingId={id} quote={latestQuote} />
//           ) : booking.status === "INQUIRY" ? (
//             <Card>
//               <CardContent className="p-5 text-center text-muted-foreground">
//                 <p className="text-sm">No quote received yet. The vendor will send one soon.</p>
//               </CardContent>
//             </Card>
//           ) : null}

//           <Card>
//             <CardHeader className="pb-0"><CardTitle className="text-base">Messages</CardTitle></CardHeader>
//             <MessageThread bookingId={id} />
//           </Card>

//           {booking.review && (
//             <Card>
//               <CardHeader className="pb-3"><CardTitle className="text-base">Your Review</CardTitle></CardHeader>
//               <CardContent className="space-y-2">
//                 <StarRating rating={booking.review.overallRating} size="md" />
//                 {booking.review.comment && (
//                   <p className="text-sm text-muted-foreground italic">&ldquo;{booking.review.comment}&rdquo;</p>
//                 )}
//               </CardContent>
//             </Card>
//           )}
//         </div>

//         <div className="space-y-4">
//           <Card>
//             <CardHeader className="pb-3">
//               <CardTitle className="text-base flex items-center gap-2">
//                 <CreditCard className="size-4 text-muted-foreground" /> Payments
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               {booking.payments.length === 0 ? (
//                 <p className="text-xs text-muted-foreground">Payment schedule will appear once the quote is accepted.</p>
//               ) : (
//                 booking.payments.map((p) => (
//                   <div key={p.id} className="space-y-1.5">
//                     <div className="flex items-center justify-between text-xs">
//                       <span className="text-muted-foreground">{MILESTONE_LABELS[p.milestone] ?? p.milestone}</span>
//                       <Badge variant={p.status === "PAID" ? "success" : p.status === "FAILED" ? "destructive" : "warning"} className="text-[10px]">
//                         {p.status}
//                       </Badge>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm font-semibold">{formatCurrency(p.amount)}</span>
//                       {p.paidAt && <span className="text-[10px] text-muted-foreground">{formatDate(p.paidAt)}</span>}
//                     </div>
//                     {p.status === "PENDING" && (
//                       <Button size="sm" className="w-full mt-1 h-8 text-xs" asChild>
//                         <Link href={`/customer/bookings/${id}/payments`}>Pay now</Link>
//                       </Button>
//                     )}
//                   </div>
//                 ))
//               )}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="pb-3"><CardTitle className="text-base">Actions</CardTitle></CardHeader>
//             <CardContent className="space-y-2">
//               <CustomerActionButtons bookingId={id} status={booking.status} />

//               {/* Dispute — available anytime from CONFIRMED onwards */}
//               {["CONFIRMED","IN_PROGRESS","COMPLETED"].includes(booking.status) && !booking.dispute && (
//                 <Button variant="outline" size="sm" className="w-full" asChild>
//                   <Link href={`/customer/bookings/${id}/dispute`}>Raise a dispute</Link>
//                 </Button>
//               )}

//               {/* Review — only after COMPLETED + all 3 payments PAID */}
//               {booking.status === "COMPLETED" && !booking.review && (() => {
//                 const allPaid = booking.payments.length === 3 &&
//                   booking.payments.every((p) => p.status === "PAID");
//                 return allPaid ? (
//                   <Button size="sm" className="w-full" asChild>
//                     <Link href={`/customer/bookings/${id}/review`}>Leave a review</Link>
//                   </Button>
//                 ) : (
//                   <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center">
//                     <p className="text-xs text-amber-700 font-medium">
//                       Complete all 3 payments to leave a review
//                     </p>
//                   </div>
//                 );
//               })()}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

// app/(dashboard)/customer/bookings/[id]/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { ReviewCard } from "./_components/review-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Booking Details" };

const STATUS_BADGE: Record<string, string> = {
  CONFIRMED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-muted text-muted-foreground",
  DISPUTED:  "bg-red-50 text-red-700 border-red-200",
  COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
};

export default async function CustomerBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
        <Badge
          variant="outline"
          className={`text-xs px-2.5 py-1 ${STATUS_BADGE[booking.status] ?? "bg-primary/10 text-primary border-primary/30"}`}
        >
          {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
        </Badge>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
        <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4" />{formatDate(event.eventDate)}
          </span>
          {event.city && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />{event.city}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" />Sent {formatDateTime(booking.createdAt)}
          </span>
        </div>
      </div>

      <BookingStatusStepper status={booking.status} />

      {booking.status === "INQUIRY" && (
        <InquiryPendingBanner
          vendorName={vendor.businessName}
          responseTime={vendor.responseTime}
        />
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

          {review && <ReviewCard review={review} />}
        </div>

        <div className="space-y-4">
          <PaymentsCard payments={payments} bookingId={id} />
          <ActionsCard
            bookingId={id}
            status={booking.status}
            payments={payments}
            review={review}
            dispute={dispute}
          />
        </div>
      </div>
    </div>
  );
}