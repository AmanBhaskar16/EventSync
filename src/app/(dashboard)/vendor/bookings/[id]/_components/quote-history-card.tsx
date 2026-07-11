
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/format";
import type { VendorBookingDetail } from "../_queries";

const QUOTE_BADGE_VARIANT: Record<string, "success" | "destructive" | "warning" | "secondary"> = {
  ACCEPTED: "success",
  REJECTED: "destructive",
  COUNTER_OFFERED:"warning",
};

export function QuoteHistoryCard({
  quotes,
  isNegotiating,
}: {
  quotes: VendorBookingDetail["quotes"];
  isNegotiating: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Quote History</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {quotes.map((q) => (
          <div key={q.id} className="flex items-center justify-between p-3 rounded-lg border border-border text-sm">
            <div>
              <span className="font-medium">Quote v{q.version}</span>
              <span className="text-muted-foreground ml-2 text-xs">{formatDateTime(q.createdAt)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">{formatCurrency(q.totalAmount)}</span>
              <Badge variant={QUOTE_BADGE_VARIANT[q.status] ?? "secondary"} className="text-[10px]">
                {q.status.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>
        ))}
        {isNegotiating && (
          <p className="text-xs text-amber-600 font-medium">
            Customer has counter-offered. Send a new quote to continue.
          </p>
        )}
      </CardContent>
    </Card>
  );
}