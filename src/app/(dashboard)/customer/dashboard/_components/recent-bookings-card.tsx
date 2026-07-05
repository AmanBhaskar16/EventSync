
import { CardShell } from "@/components/dashboard/card-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ListRow } from "@/components/dashboard/list-row";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { formatDate, formatCurrency, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "@/lib/utils";
import type { CustomerDashboardData } from "../_queries";

export const RecentBookingsCard = ({ bookings }: { bookings: CustomerDashboardData["bookings"] }) => {
  return (
    <CardShell title="Recent Bookings" viewAllHref="/customer/bookings">
      {bookings.length === 0 ? (
        <EmptyState icon={Users} message="No bookings yet" action={{ label: "Browse vendors", href: "/vendors" }} />
      ) : (
        <div className="space-y-2">
          {bookings.map((booking) => (
            <ListRow
              key={booking.id}
              href={`/customer/bookings/${booking.id}`}
              title={booking.vendor.businessName}
              subtitle={`${booking.event.title} · ${formatDate(booking.event.eventDate)}`}
              trailing={
                <>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${BOOKING_STATUS_COLORS[booking.status] ?? ""}`}>
                    {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
                  </Badge>
                  {booking.agreedPrice && <p className="text-[10px] text-muted-foreground">{formatCurrency(booking.agreedPrice)}</p>}
                </>
              }
            />
          ))}
        </div>
      )}
    </CardShell>
  );
}