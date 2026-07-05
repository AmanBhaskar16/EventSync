// app/(dashboard)/customer/dashboard/_components/upcoming-events-card.tsx
import { CardShell } from "@/components/dashboard/card-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ListRow } from "@/components/dashboard/list-row";
import { CalendarDays } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { CustomerDashboardData } from "../_queries";

export const UpcomingEventsCard = ({ events }: { events: CustomerDashboardData["upcoming"] }) => {
  return (
    <CardShell title="Upcoming Events" viewAllHref="/customer/events">
      {events.length === 0 ? (
        <EmptyState icon={CalendarDays} message="No upcoming events" action={{ label: "Create your first event", href: "/customer/events/new" }} />
      ) : (
        <div className="space-y-2">
          {events.slice(0, 4).map((event) => {
            const confirmed = event.bookings.filter((b) => b.status === "CONFIRMED").length;
            return (
              <ListRow
                key={event.id}
                href={`/customer/events/${event.id}`}
                title={event.title}
                subtitle={`${event.city ?? "Location TBD"} · ${confirmed}/${event.bookings.length} vendors confirmed`}
                trailing={
                  <>
                    <p className="text-xs font-semibold">{formatDate(event.eventDate)}</p>
                    {event.budget && <p className="text-[10px] text-muted-foreground">Budget {formatCurrency(event.budget)}</p>}
                  </>
                }
              />
            );
          })}
        </div>
      )}
    </CardShell>
  );
}