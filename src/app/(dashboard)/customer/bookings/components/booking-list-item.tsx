
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { formatDate, formatCurrency, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "@/lib/utils";
import type { BookingListItem as BookingListItemType } from "../_queries";

const QUOTE_STATUS_COLOR: Record<string, string> = {
  ACCEPTED: "text-green-600",
  REJECTED: "text-red-600",
};

export const BookingListItem = ({ booking }: { booking: BookingListItemType }) => {
  const latestQuote = booking.quotes[0];

  return (
    <Link href={`/customer/bookings/${booking.id}`}>
      <Card className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm">{booking.vendor.businessName}</p>
                <Badge variant="outline" className={`text-[10px] px-1.5 ${BOOKING_STATUS_COLORS[booking.status] ?? ""}`}>
                  {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {booking.event.title} &middot; {booking.event.city ?? "—"} &middot; {formatDate(booking.event.eventDate)}
              </p>
              {latestQuote && (
                <p className="text-xs text-muted-foreground">
                  Quote v{latestQuote.version}:{" "}
                  <span className="font-medium text-foreground">{formatCurrency(latestQuote.totalAmount)}</span>
                  {" "}&middot;{" "}
                  <span className={QUOTE_STATUS_COLOR[latestQuote.status] ?? "text-amber-600"}>{latestQuote.status}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {booking.agreedPrice && <span className="text-sm font-bold">{formatCurrency(booking.agreedPrice)}</span>}
              <ArrowRight className="size-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}