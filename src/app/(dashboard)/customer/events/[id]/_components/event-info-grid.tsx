
import { CalendarDays, MapPin, Users, Banknote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { CustomerEventDetail } from "../_queries";

export const EventInfoGrid = ({ event }: { event: CustomerEventDetail }) => {
  const infoCards = [
    { icon: CalendarDays, label: "Date", value: formatDate(event.eventDate) },
    {
      icon: MapPin, label: "Location",
      value: event.city ? `${event.city}${event.state ? `, ${event.state}` : ""}` : "Not set",
    },
    { icon: Users, label: "Guests", value: event.guestCount ? `${event.guestCount} guests` : "Not set" },
    { icon: Banknote, label: "Budget", value: event.budget ? formatCurrency(event.budget)  : "Not set" },
  ];

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {infoCards.map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <Icon className="size-5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold truncate">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {event.venue && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Venue:</span> {event.venue}
        </p>
      )}
      {event.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
      )}
    </div>
  );
}