// app/(dashboard)/customer/events/_components/event-card.tsx
import Link from "next/link";
import { CalendarDays, MapPin, Users, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatCurrency, EVENT_TYPE_LABELS } from "@/lib/utils";
import { EVENT_STATUS_COLOR, type EventListItem } from "../_queries";

export const EventCard = ({ event }: { event: EventListItem }) => {
  const confirmed = event.bookings.filter((b) => b.status === "CONFIRMED").length;

  return (
    <Link href={`/customer/events/${event.id}`}>
      <Card className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold truncate">{event.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {EVENT_TYPE_LABELS[event.type] ?? event.type}
              </p>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${EVENT_STATUS_COLOR[event.status] ?? ""}`}>
              {event.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CalendarDays className="size-3" />{formatDate(event.eventDate)}</span>
            {event.city && <span className="flex items-center gap-1"><MapPin className="size-3" />{event.city}</span>}
            {event.guestCount && <span className="flex items-center gap-1"><Users className="size-3" />{event.guestCount} guests</span>}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-muted-foreground">{event.bookings.length} vendor{event.bookings.length !== 1 ? "s" : ""}</span>
              {confirmed > 0 && <span className="text-green-600 font-medium">{confirmed} confirmed</span>}
              {event.budget && <span className="text-muted-foreground">Budget: {formatCurrency(event.budget)}</span>}
            </div>
            <ArrowRight className="size-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}