
// URL: /customer/dashboard

import { auth }     from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma }   from "@/lib/db/prisma";
import Link         from "next/link";
import {
  CalendarDays, Users, CreditCard,
  TrendingUp, Plus, ArrowRight,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge }    from "@/components/ui/badge";
import {
  getGreeting, formatDate, formatCurrency,
  BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS,
} from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

// ── Local types matching schema ──────────────────────────────────────────────

type EventRow = {
  id:        string;
  title:     string;
  type:      string;
  status:    string;
  eventDate: Date;
  city:      string | null;
  budget:    number | null;
  bookings:  { id: string; status: string }[];
};

type BookingRow = {
  id:          string;
  status:      string;
  agreedPrice: number | null;
  createdAt:   Date;
  event:  { id: string; title: string; eventDate: Date };
  vendor: { id: string; businessName: string; category: string; city: string };
};

// ─────────────────────────────────────────────────────────────────────────────

export default async function CustomerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Get customer profile
  const customer = await prisma.customer.findUnique({
    where: { userId: session.user.id },
  });

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Customer profile not found.</p>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Parallel queries — all use correct schema relations
  const [rawEvents, rawBookings, totalSpend] = await Promise.all([
    // Upcoming + recent events with booking count
    prisma.event.findMany({
      where:   { customerId: customer.id },
      include: { bookings: { select: { id: true, status: true } } },
      orderBy: { eventDate: "desc" },
      take:    10,
    }),
    // Recent bookings with vendor + event info
    prisma.booking.findMany({
      where:   { event: { customerId: customer.id } },
      include: {
        event:  { select: { id: true, title: true, eventDate: true } },
        vendor: { select: { id: true, businessName: true, category: true, city: true } },
      },
      orderBy: { createdAt: "desc" },
      take:    5,
    }),
    // Total confirmed spend
    prisma.payment.aggregate({
      where:  { booking: { event: { customerId: customer.id } }, status: "PAID" },
      _sum:   { amount: true },
    }),
  ]);

  const events   = rawEvents   as unknown as EventRow[];
  const bookings = rawBookings as unknown as BookingRow[];
  const spent    = Number((totalSpend as { _sum: { amount?: number } })._sum.amount ?? 0);
  const now      = new Date();

  // Stats
  const upcoming          = events.filter((e) => new Date(e.eventDate) > now);
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED").length;
  const totalBookings     = bookings.length;

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  const statCards = [
    { label: "Total Events",    value: events.length,     icon: CalendarDays, color: "text-primary"    },
    { label: "Upcoming",        value: upcoming.length,   icon: TrendingUp,   color: "text-blue-600"   },
    { label: "Total Bookings",  value: totalBookings,     icon: Users,        color: "text-purple-600" },
    { label: "Total Spent",     value: formatCurrency(spent), icon: CreditCard, color: "text-green-600" },
  ];

  return (
    <div className="space-y-8 max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Good {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your events.
          </p>
        </div>
        <Button asChild>
          <Link href="/customer/events/new">
            <Plus className="size-4" /> New Event
          </Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                </div>
                <s.icon className={`size-8 opacity-60 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Upcoming Events</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/customer/events">
                View all <ArrowRight className="size-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {upcoming.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <CalendarDays className="size-8 mx-auto text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground">No upcoming events</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/customer/events/new">Create your first event</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {upcoming.slice(0, 4).map((event) => {
                  const confirmed = event.bookings.filter((b) => b.status === "CONFIRMED").length;
                  return (
                    <Link
                      key={event.id}
                      href={`/customer/events/${event.id}`}
                      className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {event.city ?? "Location TBD"} &middot; {confirmed}/{event.bookings.length} vendors confirmed
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-xs font-semibold">{formatDate(event.eventDate)}</p>
                        {event.budget && (
                          <p className="text-[10px] text-muted-foreground">
                            Budget {formatCurrency(event.budget)}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/customer/bookings">
                View all <ArrowRight className="size-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {bookings.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Users className="size-8 mx-auto text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground">No bookings yet</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/vendors">Browse vendors</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {bookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/customer/bookings/${booking.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{booking.vendor.businessName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {booking.event.title} &middot; {formatDate(booking.event.eventDate)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0.5 ${BOOKING_STATUS_COLORS[booking.status] ?? ""}`}
                      >
                        {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
                      </Badge>
                      {booking.agreedPrice && (
                        <p className="text-[10px] text-muted-foreground">
                          {formatCurrency(booking.agreedPrice)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* All events table — past events */}
      {events.filter((e) => new Date(e.eventDate) <= now).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Past Events</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {events
                .filter((e) => new Date(e.eventDate) <= now)
                .slice(0, 3)
                .map((event) => (
                  <Link
                    key={event.id}
                    href={`/customer/events/${event.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors opacity-70 hover:opacity-100"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {event.city ?? "—"} &middot; {event.bookings.length} vendor{event.bookings.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-xs text-muted-foreground">{formatDate(event.eventDate)}</p>
                      <Badge variant="muted" className="text-[10px] mt-0.5">{event.status}</Badge>
                    </div>
                  </Link>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}