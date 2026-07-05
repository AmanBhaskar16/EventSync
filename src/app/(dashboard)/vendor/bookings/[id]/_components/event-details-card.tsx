
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { VendorBookingDetail } from "../_queries";

export const EventDetailsCard = ({ event }: { event: VendorBookingDetail["event"] }) => {
  const rows = [
    { label: "Date", value: formatDate(event.eventDate) },
    { label: "City", value: event.city ?? "Not specified" },
    { label: "Guests", value: event.guestCount ? `${event.guestCount} guests` : "Not specified" },
    { label: "Budget", value: event.budget ? formatCurrency(event.budget) : "Not specified" },
    { label: "Event type", value: event.type },
  ];

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Event Details</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-right">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}