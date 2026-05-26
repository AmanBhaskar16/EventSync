
// URL: /vendor/bookings — Kanban-style pipeline list

import { auth }     from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma }   from "@/lib/db/prisma";
import Link         from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge }   from "@/components/ui/badge";
import {
  formatDate, formatCurrency,
  BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS,
} from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Bookings Pipeline" };

const PIPELINE_STAGES = [
  { key: "INQUIRY",     label: "New Inquiries",  color: "border-blue-300 bg-blue-50"   },
  { key: "QUOTE_SENT",  label: "Quote Sent",     color: "border-purple-300 bg-purple-50"},
  { key: "NEGOTIATION", label: "Negotiation",    color: "border-amber-300 bg-amber-50"  },
  { key: "CONFIRMED",   label: "Confirmed",      color: "border-green-300 bg-green-50"  },
  { key: "IN_PROGRESS", label: "In Progress",    color: "border-cyan-300 bg-cyan-50"    },
  { key: "COMPLETED",   label: "Completed",      color: "border-gray-300 bg-gray-50"    },
];

export default async function VendorBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const vendor = await prisma.vendor.findUnique({
    where:  { userId: session.user.id },
    select: { id: true },
  });
  if (!vendor) redirect("/vendor/dashboard");

  const bookings = await prisma.booking.findMany({
    where:   { vendorId: (vendor as { id: string }).id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, 
      status: true, 
      agreedPrice: true, 
      createdAt: true,
      event: {
        select: {
          id: true, 
          title: true, 
          eventDate: true, 
          city: true, 
          type: true,
          customer: { 
            select: { 
              user: { 
                select: { 
                  name: true 
                } 
              } 
            } 
          },
        },
      },
      quotes: {
        orderBy: { version: "desc" },
        take:    1,
        select:  { 
          totalAmount: true, 
          status: true 
        },
      },
    },
  });

  type BookingRow = typeof bookings[number];

  const grouped: Record<string, BookingRow[]> = {};
  for (const stage of PIPELINE_STAGES) grouped[stage.key] = [];
  for (const b of bookings) {
    if (grouped[b.status]) grouped[b.status].push(b);
  }

  const activeCount = bookings.filter((b) =>
    !["COMPLETED","CANCELLED","DISPUTED"].includes(b.status)
  ).length;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bookings Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {activeCount} active &middot; {bookings.length} total
        </p>
      </div>

      {/* Pipeline stages */}
      <div className="space-y-6">
        {PIPELINE_STAGES.map((stage) => {
          const items = grouped[stage.key] ?? [];
          return (
            <section key={stage.key}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-semibold">{stage.label}</h2>
                <span className="size-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                  {items.length}
                </span>
              </div>
              {items.length === 0 ? (
                <div className={`rounded-xl border-2 border-dashed p-4 text-center text-xs text-muted-foreground ${stage.color.split(" ")[0].replace("border-","border-dashed border-")}`}>
                  No bookings in this stage
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {items.map((b) => {
                    const event  = b.event  as { id: string; title: string; eventDate: Date; city: string | null; customer: { user: { name: string | null } } };
                    const quotes = b.quotes as Array<{ totalAmount: number; status: string }>;
                    const latestQuote = quotes[0];
                    return (
                      <Link key={b.id} href={`/vendor/bookings/${b.id}`}>
                        <Card className={`border-l-4 hover:shadow-md transition-all cursor-pointer h-full ${stage.color.split(" ")[1] ? "" : ""}`}
                          style={{ borderLeftColor: stage.color.includes("blue") ? "#93c5fd" : stage.color.includes("purple") ? "#c4b5fd" : stage.color.includes("amber") ? "#fcd34d" : stage.color.includes("green") ? "#86efac" : stage.color.includes("cyan") ? "#67e8f9" : "#d1d5db" }}>
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-sm leading-tight line-clamp-2">
                                {event.customer.user.name ?? "Customer"}
                              </p>
                              <ArrowRight className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {event.city ?? "—"} &middot; {formatDate(event.eventDate)}
                            </p>
                            {latestQuote && (
                              <p className="text-xs font-medium">
                                {formatCurrency(latestQuote.totalAmount)}
                              </p>
                            )}
                            <Badge variant="outline"
                              className={`text-[10px] px-1.5 py-0.5 ${BOOKING_STATUS_COLORS[b.status] ?? ""}`}>
                              {BOOKING_STATUS_LABELS[b.status] ?? b.status}
                            </Badge>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}