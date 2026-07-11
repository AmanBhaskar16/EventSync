// // src/app/(dashboard)/vendor/bookings/[id]/page.tsx
// // URL: /vendor/bookings/[id]

// import { auth }              from "@/lib/auth";
// import { redirect, notFound } from "next/navigation";
// import { prisma }            from "@/lib/db/prisma";
// import Link                  from "next/link";
// import { ArrowLeft, CalendarDays, MapPin, Users, Clock } from "lucide-react";
// import { Button }  from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge }   from "@/components/ui/badge";
// import { BookingStatusStepper }  from "@/components/vendors/booking-status-stepper";
// import { QuoteBuilder }          from "@/components/bookings/quote-builder";
// import { MessageThread }         from "@/components/bookings/message-thread";
// import { BookingActionButtons }  from "@/components/bookings/booking-action-buttons";
// import {
//   formatDate, formatCurrency,
//   BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS,
// } from "@/lib/utils";
// import { formatDateTime } from "@/lib/utils/format";
// import type { Metadata } from "next";

// export const metadata: Metadata = { title: "Booking Detail" };

// type QuoteRow = {
//   id: string; version: number; status: string; totalAmount: number;
//   subtotal: number; gstRate: number; gstAmount: number;
//   validUntil: string; createdAt: Date;
// };
// type PaymentRow = {
//   id: string; milestone: string; amount: number; status: string; paidAt: Date | null;
// };
// type EventDetail = {
//   id: string; title: string; type: string; eventDate: Date;
//   city: string | null; guestCount: number | null; budget: number | null; description: string | null;
//   customer: { user: { id: string; name: string | null; email: string; phone: string | null } };
// };
// type VendorInfo = { id: string; userId: string; businessName: string };
// type BookingDetail = {
//   id: string; status: string; agreedPrice: number | null;
//   specialRequests: string | null; guestCount: number | null;
//   createdAt: Date; confirmedAt: Date | null;
//   vendor: VendorInfo; event: EventDetail;
//   quotes: QuoteRow[]; payments: PaymentRow[];
// };

// export default async function VendorBookingDetailPage(
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const session = await auth();
//   if (!session?.user) redirect("/login");

//   const { id } = await params;

//   const raw = await prisma.booking.findUnique({
//     where: { id },
//     select: {
//       id: true, status: true, agreedPrice: true, specialRequests: true,
//       guestCount: true, createdAt: true, confirmedAt: true,
//       vendor: { select: { id: true, userId: true, businessName: true } },
//       event: {
//         select: {
//           id: true, title: true, type: true, eventDate: true,
//           city: true, guestCount: true, budget: true, description: true,
//           customer: {
//             select: { user: { select: { id: true, name: true, email: true, phone: true } } },
//           },
//         },
//       },
//       quotes: {
//         orderBy: { version: "desc" },
//         select: {
//           id: true, version: true, status: true, totalAmount: true,
//           subtotal: true, gstRate: true, gstAmount: true,
//           validUntil: true, createdAt: true,
//         },
//       },
//       payments: {
//         orderBy: { createdAt: "asc" },
//         select: { id: true, milestone: true, amount: true, status: true, paidAt: true },
//       },
//     },
//   });

//   if (!raw) notFound();
//   const booking = raw as unknown as BookingDetail;

//   if (booking.vendor.userId !== session.user.id && session.user.role !== "ADMIN") {
//     redirect("/vendor/dashboard");
//   }

//   const canSendQuote = ["INQUIRY", "NEGOTIATION"].includes(booking.status);

//   return (
//     <div className="space-y-6 max-w-5xl">

//       <div className="flex items-center justify-between gap-4">
//         <Button variant="ghost" size="sm" asChild className="-ml-2">
//           <Link href="/vendor/bookings"><ArrowLeft className="size-4" /> All bookings</Link>
//         </Button>
//         <Badge variant="outline" className={`text-xs px-2.5 py-1 ${BOOKING_STATUS_COLORS[booking.status] ?? ""}`}>
//           {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
//         </Badge>
//       </div>

//       <div>
//         <h1 className="text-2xl font-bold tracking-tight">{booking.event.title}</h1>
//         <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
//           <span className="flex items-center gap-1.5"><CalendarDays className="size-4" />{formatDate(booking.event.eventDate)}</span>
//           {booking.event.city && <span className="flex items-center gap-1.5"><MapPin className="size-4" />{booking.event.city}</span>}
//           {booking.event.guestCount && <span className="flex items-center gap-1.5"><Users className="size-4" />{booking.event.guestCount} guests</span>}
//           <span className="flex items-center gap-1.5"><Clock className="size-4" />Received {formatDateTime(booking.createdAt)}</span>
//         </div>
//       </div>

//       <BookingStatusStepper status={booking.status} />

//       <div className="grid lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 space-y-6">

//           {/* Customer info */}
//           <Card>
//             <CardHeader className="pb-3"><CardTitle className="text-base">Customer</CardTitle></CardHeader>
//             <CardContent className="space-y-2">
//               <div className="flex items-center gap-3">
//                 <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
//                   {(booking.event.customer.user.name ?? "C").charAt(0).toUpperCase()}
//                 </div>
//                 <div>
//                   <p className="font-semibold text-sm">{booking.event.customer.user.name ?? "Customer"}</p>
//                   <p className="text-xs text-muted-foreground">{booking.event.customer.user.email}</p>
//                   {booking.event.customer.user.phone && (
//                     <p className="text-xs text-muted-foreground">{booking.event.customer.user.phone}</p>
//                   )}
//                 </div>
//               </div>
//               {booking.specialRequests && (
//                 <div className="pt-2 space-y-1 border-t border-border">
//                   <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Special requests</p>
//                   <p className="text-sm text-muted-foreground whitespace-pre-wrap">{booking.specialRequests}</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Quote builder or history */}
//           {canSendQuote ? (
//             <QuoteBuilder bookingId={id} />
//           ) : booking.quotes.length > 0 ? (
//             <Card>
//               <CardHeader className="pb-3"><CardTitle className="text-base">Quote History</CardTitle></CardHeader>
//               <CardContent className="space-y-3">
//                 {booking.quotes.map((q) => (
//                   <div key={q.id} className="flex items-center justify-between p-3 rounded-lg border border-border text-sm">
//                     <div>
//                       <span className="font-medium">Quote v{q.version}</span>
//                       <span className="text-muted-foreground ml-2 text-xs">{formatDateTime(q.createdAt)}</span>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <span className="font-semibold">{formatCurrency(q.totalAmount)}</span>
//                       <Badge variant={
//                         q.status === "ACCEPTED"       ? "success"     :
//                         q.status === "REJECTED"       ? "destructive" :
//                         q.status === "COUNTER_OFFERED"? "warning"     : "secondary"
//                       } className="text-[10px]">
//                         {q.status.replace(/_/g," ")}
//                       </Badge>
//                     </div>
//                   </div>
//                 ))}
//                 {booking.status === "NEGOTIATION" && (
//                   <p className="text-xs text-amber-600 font-medium">
//                     Customer has counter-offered. Send a new quote to continue.
//                   </p>
//                 )}
//               </CardContent>
//             </Card>
//           ) : null}

//           {/* Message thread */}
//           <Card>
//             <CardHeader className="pb-0"><CardTitle className="text-base">Messages</CardTitle></CardHeader>
//             <MessageThread bookingId={id} />
//           </Card>
//         </div>

//         {/* Right sidebar */}
//         <div className="space-y-4">
//           {/* Event details */}
//           <Card>
//             <CardHeader className="pb-3"><CardTitle className="text-base">Event Details</CardTitle></CardHeader>
//             <CardContent className="space-y-2 text-sm">
//               {[
//                 { label: "Date",       value: formatDate(booking.event.eventDate) },
//                 { label: "City",       value: booking.event.city      ?? "Not specified" },
//                 { label: "Guests",     value: booking.event.guestCount ? `${booking.event.guestCount} guests` : "Not specified" },
//                 { label: "Budget",     value: booking.event.budget    ? formatCurrency(booking.event.budget) : "Not specified" },
//                 { label: "Event type", value: booking.event.type },
//               ].map(({ label, value }) => (
//                 <div key={label} className="flex justify-between">
//                   <span className="text-muted-foreground">{label}</span>
//                   <span className="font-medium text-right">{value}</span>
//                 </div>
//               ))}
//               {booking.agreedPrice && (
//                 <div className="flex justify-between pt-2 border-t border-border">
//                   <span className="text-muted-foreground">Agreed price</span>
//                   <span className="font-bold text-primary">{formatCurrency(booking.agreedPrice)}</span>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Payments */}
//           {booking.payments.length > 0 && (
//             <Card>
//               <CardHeader className="pb-3"><CardTitle className="text-base">Payments</CardTitle></CardHeader>
//               <CardContent className="space-y-3">
//                 {booking.payments.map((p) => (
//                   <div key={p.id} className="flex items-center justify-between text-sm">
//                     <div>
//                       <p className="text-xs text-muted-foreground">{p.milestone.replace(/_/g," ")}</p>
//                       <p className="font-semibold">{formatCurrency(p.amount)}</p>
//                     </div>
//                     <Badge variant={p.status === "PAID" ? "success" : "warning"} className="text-[10px]">
//                       {p.status}
//                     </Badge>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           )}

//           {/* Action buttons — now client component with working API calls */}
//           <Card>
//             <CardHeader className="pb-3"><CardTitle className="text-base">Actions</CardTitle></CardHeader>
//             <CardContent>
//               <BookingActionButtons bookingId={id} status={booking.status} />
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

// app/(dashboard)/vendor/bookings/[id]/page.tsx
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

export default async function VendorBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { id } = await params;

  const booking = await getVendorBookingDetail(id, session.user.id, session.user.role);
  const { event, quotes, payments, canSendQuote } = booking;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/vendor/bookings"><ArrowLeft className="size-4" /> All bookings</Link>
        </Button>
        <Badge
          variant="outline"
          className={`text-xs px-2.5 py-1 ${BOOKING_STATUS_COLORS[booking.status] ?? ""}`}
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
          {event.guestCount && (
            <span className="flex items-center gap-1.5">
              <Users className="size-4" />{event.guestCount} guests
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" />Received {formatDateTime(booking.createdAt)}
          </span>
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
          ) : quotes.length > 0 ? (
            <QuoteHistoryCard
              quotes={quotes}
              isNegotiating={booking.status === "NEGOTIATION"}
            />
          ) : null}

          <Card>
            <CardHeader className="pb-0"><CardTitle className="text-base">Messages</CardTitle></CardHeader>
            <MessageThread bookingId={id} />
          </Card>
        </div>

        <div className="space-y-4">
          <EventDetailsCard event={event} agreedPrice={booking.agreedPrice} />
          <PaymentsCard payments={payments} />
          <ActionsCard bookingId={id} status={booking.status} />
        </div>
      </div>
    </div>
  );
}