
// Vendor view: quote builder + message thread + booking info

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import {
  ArrowLeft, CalendarDays, MapPin, Users, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingStatusStepper } from "@/components/vendors/booking-status-stepper";
import { QuoteBuilder } from "@/components/bookings/quote-builder";
import { MessageThread } from "@/components/bookings/message-thread";
import {
  formatDate, formatCurrency,
  BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, VENDOR_CATEGORY_LABELS,
} from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/format";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Booking Detail" };

export default async function VendorBookingDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    select: {
      id: true, status: true, agreedPrice: true, specialRequests: true,
      guestCount: true, createdAt: true, confirmedAt: true,
      vendor: { 
        select: { 
          id: true, 
          userId: true, 
          businessName: true 
        } 
      },
      event: {
        select: {
          id: true, 
          title: true, 
          type: true, 
          eventDate: true,
          city: true, 
          guestCount: true, 
          budget: true, 
          description: true,
          customer: {
            select: { 
              user: { 
                select: { 
                  id: true, 
                  name: true, 
                  email: true, 
                  phone: true 
                } 
              } 
            },
          },
        },
      },
      quotes: {
        orderBy: { version: "desc" },
        select: {
          id: true, 
          version: true, 
          status: true, 
          totalAmount: true,
          subtotal: true, 
          gstRate: true, 
          gstAmount: true,
          validUntil: true, 
          createdAt: true,
        },
      },
      payments: {
        select: { 
          id: true, 
          milestone: true, 
          amount: true, 
          status: true, 
          paidAt: true 
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!booking) notFound();

  const b      = booking as Record<string, unknown>;
  const vendor = b.vendor as { id: string; userId: string; businessName: string };

  // Only this vendor can access
  if (vendor.userId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/vendor/dashboard");
  }

  const event    = b.event as { 
    id: string; 
    title: string; 
    type: string; 
    eventDate: Date; 
    city: string | null; 
    guestCount: number | null; 
    budget: number | null; 
    description: string | null;
    customer: { 
      user: { 
        id: string; 
        name: string | null; 
        email: string; 
        phone: string | null 
      } 
    } 
  };
  const quotes   = b.quotes as Array<{ 
    id: string; 
    version: number; 
    status: string; 
    totalAmount: number; 
    subtotal: number; 
    gstRate: number; 
    gstAmount: number; 
    validUntil: string; 
    createdAt: Date 
  }>;
  const payments = b.payments as Array<{ 
    id: string; 
    milestone: string; 
    amount: number; 
    status: string; 
    paidAt: Date | null 
  }>;

  const canSendQuote = ["INQUIRY", "NEGOTIATION"].includes(booking.status);
  const latestQuote  = quotes[0] ?? null;

  return (
    <div className="space-y-6 max-w-5xl">

      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/vendor/bookings"><ArrowLeft className="size-4" /> All bookings</Link>
        </Button>
        <Badge variant="outline"
          className={`text-xs px-2.5 py-1 ${BOOKING_STATUS_COLORS[booking.status] ?? ""}`}>
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

          {/* Customer info */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Customer</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                  {(event.customer.user.name ?? "C").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm">{event.customer.user.name ?? "Customer"}</p>
                  <p className="text-xs text-muted-foreground">{event.customer.user.email}</p>
                  {event.customer.user.phone && (
                    <p className="text-xs text-muted-foreground">{event.customer.user.phone}</p>
                  )}
                </div>
              </div>
              {event.description && (
                <p className="text-sm text-muted-foreground leading-relaxed pt-1 border-t border-border">
                  {event.description}
                </p>
              )}
              {booking.specialRequests && (
                <div className="pt-1 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Special requests</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{booking.specialRequests}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quote builder or history */}
          {canSendQuote ? (
            <QuoteBuilder bookingId={id} />
          ) : latestQuote ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quote History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quotes.map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-3 rounded-lg border border-border text-sm">
                    <div>
                      <span className="font-medium">Quote v{q.version}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{formatDateTime(q.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{formatCurrency(q.totalAmount)}</span>
                      <Badge variant={
                        q.status === "ACCEPTED" ? "success" :
                        q.status === "REJECTED" ? "destructive" :
                        q.status === "COUNTER_OFFERED" ? "warning" : "secondary"
                      } className="text-[10px]">
                        {q.status.replace("_"," ")}
                      </Badge>
                    </div>
                  </div>
                ))}
                {booking.status === "NEGOTIATION" && (
                  <p className="text-xs text-amber-600 font-medium">
                    Customer has counter-offered. Send a new quote to continue negotiation.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : null}

          {/* Message thread */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base">Messages</CardTitle>
            </CardHeader>
            <MessageThread bookingId={id} />
          </Card>

        </div>

        {/* Right: event + payment info */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Event Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                { label: "Date",        value: formatDate(event.eventDate) },
                { label: "City",        value: event.city ?? "Not specified" },
                { label: "Guests",      value: event.guestCount ? `${event.guestCount} guests` : "Not specified" },
                { label: "Budget",      value: event.budget ? formatCurrency(event.budget) : "Not specified" },
                { label: "Event type",  value: event.type },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-right">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {payments.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Payments</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">{p.milestone.replace(/_/g," ")}</p>
                      <p className="font-semibold">{formatCurrency(p.amount)}</p>
                    </div>
                    <Badge variant={p.status === "PAID" ? "success" : "warning"} className="text-[10px]">
                      {p.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {booking.status === "CONFIRMED" && (
                <Button className="w-full" size="sm">Mark as In Progress</Button>
              )}
              {booking.status === "IN_PROGRESS" && (
                <Button className="w-full bg-green-600 hover:bg-green-700" size="sm">Mark as Completed</Button>
              )}
              {!["COMPLETED","CANCELLED","DISPUTED"].includes(booking.status) && (
                <Button variant="outline" size="sm"
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive">
                  Cancel booking
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}