
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { formatDate, formatCurrency, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "@/lib/utils";
import type { PipelineBooking } from "../_queries";

export const BookingPipelineCard = ({ booking, borderColor }: { booking: PipelineBooking; borderColor: string }) => {
  const latestQuote = booking.quotes[0];

  return (
    <Link href={`/vendor/bookings/${booking.id}`}>
      <Card className="border-l-4 hover:shadow-md transition-all cursor-pointer h-full" style={{ borderLeftColor: borderColor }}>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm leading-tight line-clamp-2">
              {booking.event.customer.user.name ?? "Customer"}
            </p>
            <ArrowRight className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">{booking.event.title}</p>
          <p className="text-xs text-muted-foreground">
            {booking.event.city ?? "—"} &middot; {formatDate(booking.event.eventDate)}
          </p>
          {latestQuote && <p className="text-xs font-medium">{formatCurrency(latestQuote.totalAmount)}</p>}
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${BOOKING_STATUS_COLORS[booking.status] ?? ""}`}>
            {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}