
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENT_TYPE_LABELS } from "@/lib/utils";
import { getCustomerEventDetail, EVENT_STATUS_BADGE } from "./_queries";
import { EventInfoGrid } from "./_components/event-info-grid";
import { VendorsBookedCard } from "./_components/vendors-booked-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Event Details" };

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const event = await getCustomerEventDetail(id, session.user.id);

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/customer/events"><ArrowLeft className="size-4" /> All Events</Link>
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
          <p className="text-sm text-muted-foreground">{EVENT_TYPE_LABELS[event.type] ?? event.type}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${EVENT_STATUS_BADGE[event.status] ?? ""}`}>
          {event.status}
        </span>
      </div>

      <EventInfoGrid event={event} />

      <VendorsBookedCard bookings={event.bookings} totalSpend={event.totalSpend} />
    </div>
  );
}