
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, BOOKING_STATUS_LABELS } from "@/lib/utils";
import type { AnalyticsData } from "../_queries";

export const RecentBookingsCard = ({ bookings }: { bookings: AnalyticsData["recentBookings"] }) => {
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Recent Bookings</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2">
          {bookings.map((b:{
              id: string;
              status: string;
              agreedPrice: number | null;
              createdAt: Date;
              vendor: { businessName: string };
              event: { title: string; eventDate: Date };
            }) => (
            <div key={b.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{b.vendor.businessName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {b.event.title} &middot; {formatDate(b.event.eventDate)}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                {b.agreedPrice && (
                  <span className="text-xs font-medium">{formatCurrency(b.agreedPrice)}</span>
                )}
                <Badge variant="outline" className="text-[10px]">
                  {BOOKING_STATUS_LABELS[b.status] ?? b.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}