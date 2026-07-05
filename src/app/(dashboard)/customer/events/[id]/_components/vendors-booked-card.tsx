
import Link from "next/link";
import { Search, CheckCircle, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, VENDOR_CATEGORY_LABELS, BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS } from "@/lib/utils";
import type { EventBookingRow } from "../_queries";

// Local — only used here
function StatusIcon({ status }: { status: string }) {
  if (status === "CONFIRMED") return <CheckCircle className="size-4 text-green-600" />;
  if (status === "CANCELLED") return <XCircle     className="size-4 text-red-600"   />;
  return <Clock className="size-4 text-blue-600" />;
}

export const VendorsBookedCard = ({ bookings, totalSpend }: { bookings: EventBookingRow[]; totalSpend: number }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base">Vendors Booked</CardTitle>
          {totalSpend > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Total confirmed: <span className="font-semibold text-foreground">{formatCurrency(totalSpend)}</span>
            </p>
          )}
        </div>
        <Button asChild size="sm">
          <Link href="/vendors"><Search className="size-4" /> Find vendors</Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {bookings.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <Search className="size-8 mx-auto text-muted-foreground opacity-30" />
            <p className="text-sm text-muted-foreground">No vendors booked yet.</p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/vendors">Browse vendors</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.map((b) => (
              <Link key={b.id} href={`/customer/bookings/${b.id}`}>
                <div className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusIcon status={b.status} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{b.vendor.businessName}</p>
                      <p className="text-xs text-muted-foreground">
                        {VENDOR_CATEGORY_LABELS[b.vendor.category] ?? b.vendor.category} &middot; {b.vendor.city}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    {b.agreedPrice && <span className="text-xs font-medium">{formatCurrency(b.agreedPrice)}</span>}
                    <Badge variant="outline" className={`text-[10px] ${BOOKING_STATUS_COLORS[b.status] ?? ""}`}>
                      {BOOKING_STATUS_LABELS[b.status] ?? b.status}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}