
import { CardShell } from "@/components/dashboard/card-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ListRow } from "@/components/dashboard/list-row";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { formatDate, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "@/lib/utils";
import type { VendorDashboardData } from "../_queries";

export const NeedsActionCard = ({ bookings }: { bookings: VendorDashboardData["pending"] }) => {
  const badge = bookings.length > 0 ? (
    <span className="size-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
      {bookings.length}
    </span>
  ) : undefined;

  return (
    <CardShell title="Needs Action" badge={badge} viewAllHref="/vendor/bookings?status=INQUIRY">
      {bookings.length === 0 ? (
        <EmptyState icon={CalendarDays} message="No pending bookings — all clear! 🎉" />
      ) : (
        <div className="space-y-2">
          {bookings.slice(0, 5).map((b) => (
            <ListRow
              key={b.id}
              href={`/vendor/bookings/${b.id}`}
              title={b.event.title}
              subtitle={`${b.event.city ?? "—"} · ${formatDate(b.event.eventDate)}`}
              trailing={
                <Badge variant="outline" className={`text-[10px] ${BOOKING_STATUS_COLORS[b.status] ?? ""}`}>
                  {BOOKING_STATUS_LABELS[b.status] ?? b.status}
                </Badge>
              }
            />
          ))}
        </div>
      )}
    </CardShell>
  );
}