
import { CardShell } from "@/components/dashboard/card-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ListRow } from "@/components/dashboard/list-row";
import { CalendarDays } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { VendorDashboardData } from "../_queries";

export const UpcomingEventsCard = ({ bookings }: { bookings: VendorDashboardData["upcoming"] }) => {
  const now = new Date();

  return (
    <CardShell title="Upcoming Events" viewAllHref="/vendor/bookings?status=CONFIRMED">
      {bookings.length === 0 ? (
        <EmptyState icon={CalendarDays} message="No confirmed upcoming events" />
      ) : (
        <div className="space-y-2">
          {bookings.slice(0, 5).map((b) => {
            const daysLeft = Math.ceil((new Date(b.event.eventDate).getTime() - now.getTime()) / 86400000);
            const colorClass = daysLeft <= 7 ? "text-red-600" : daysLeft <= 14 ? "text-amber-600" : "text-green-600";
            return (
              <ListRow
                key={b.id}
                href={`/vendor/bookings/${b.id}`}
                title={b.event.title}
                subtitle={`${b.event.city ?? "—"} · ${formatDate(b.event.eventDate)}`}
                trailing={
                  <>
                    <p className={`text-xs font-semibold ${colorClass}`}>{daysLeft === 0 ? "Today!" : `${daysLeft}d away`}</p>
                    {b.agreedPrice && <p className="text-[10px] text-muted-foreground">{formatCurrency(b.agreedPrice)}</p>}
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