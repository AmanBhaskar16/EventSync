
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListRow } from "@/components/dashboard/list-row";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { CustomerDashboardData } from "../_queries";

export const PastEventsCard = ({ events }: { events: CustomerDashboardData["past"] }) => {
  if (events.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Past Events</CardTitle></CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {events.slice(0, 3).map((event) => (
            <ListRow
              key={event.id}
              href={`/customer/events/${event.id}`}
              title={event.title}
              subtitle={`${event.city ?? "—"} · ${event.bookings.length} vendor${event.bookings.length !== 1 ? "s" : ""}`}
              className="opacity-70 hover:opacity-100"
              trailing={
                <>
                  <p className="text-xs text-muted-foreground">{formatDate(event.eventDate)}</p>
                  <Badge variant="muted" className="text-[10px] mt-0.5">{event.status}</Badge>
                </>
              }
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}