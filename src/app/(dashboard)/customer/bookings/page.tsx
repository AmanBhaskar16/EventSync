
// URL: /customer/bookings

import { auth }     from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma }   from "@/lib/db/prisma";
import Link         from "next/link";
import { CalendarDays, ArrowRight, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge }   from "@/components/ui/badge";
import { Button }  from "@/components/ui/button";
import {
  formatDate, formatCurrency,
  BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS,
} from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Bookings" };

export default async function CustomerBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const customer = await prisma.customer.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!customer) redirect("/customer/dashboard");

  const bookings = await prisma.booking.findMany({
    where:   { event: { customerId: (customer as { id: string }).id } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, status: true, agreedPrice: true, createdAt: true,
      event:  { select: { id: true, title: true, eventDate: true, city: true, type: true } },
      vendor: { select: { id: true, businessName: true, category: true, city: true } },
      quotes: {
        orderBy: { version: "desc" },
        take:    1,
        select:  { id: true, totalAmount: true, status: true, version: true },
      },
    },
  });

  type BookingRow = typeof bookings[number];

  const grouped: Record<string, BookingRow[]> = {
    Active:    [],
    Completed: [],
    Cancelled: [],
  };

  for (const b of bookings) {
    if (["COMPLETED"].includes(b.status))                        grouped.Completed.push(b);
    else if (["CANCELLED", "DISPUTED"].includes(b.status))       grouped.Cancelled.push(b);
    else                                                         grouped.Active.push(b);
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button asChild>
          <Link href="/vendors"><Search className="size-4" /> Find vendors</Link>
        </Button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <CalendarDays className="size-12 mx-auto text-muted-foreground opacity-30" />
          <p className="font-medium text-lg">No bookings yet</p>
          <p className="text-sm text-muted-foreground">Browse vendors and send your first inquiry.</p>
          <Button asChild><Link href="/vendors">Browse vendors</Link></Button>
        </div>
      ) : (
        Object.entries(grouped).map(([group, items]) =>
          items.length > 0 ? (
            <section key={group} className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {group} <span className="text-primary ml-1">{items.length}</span>
              </h2>
              <div className="space-y-3">
                {items.map((b) => {
                  const latestQuote = (b.quotes as Array<{ id: string; totalAmount: number; status: string; version: number }>)[0];
                  return (
                    <Link key={b.id} href={`/customer/bookings/${b.id}`}>
                      <Card className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-sm">{b.vendor.businessName}</p>
                                <Badge variant="outline"
                                  className={`text-[10px] px-1.5 ${BOOKING_STATUS_COLORS[b.status] ?? ""}`}>
                                  {BOOKING_STATUS_LABELS[b.status] ?? b.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {b.event.title} &middot; {b.event.city ?? "—"} &middot; {formatDate(b.event.eventDate)}
                              </p>
                              {latestQuote && (
                                <p className="text-xs text-muted-foreground">
                                  Quote v{latestQuote.version}: <span className="font-medium text-foreground">{formatCurrency(latestQuote.totalAmount)}</span>
                                  {" "}&middot; <span className={latestQuote.status === "ACCEPTED" ? "text-green-600" : latestQuote.status === "REJECTED" ? "text-red-600" : "text-amber-600"}>{latestQuote.status}</span>
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {b.agreedPrice && (
                                <span className="text-sm font-bold">{formatCurrency(b.agreedPrice)}</span>
                              )}
                              <ArrowRight className="size-4 text-muted-foreground" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : null
        )
      )}
    </div>
  );
}