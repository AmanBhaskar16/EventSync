
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { VendorBookingDetail } from "../_queries";

export function PaymentsCard({ payments }: { payments: VendorBookingDetail["payments"] }) {
  if (payments.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Payments</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {payments.map((p) => (
          <div key={p.id} className="flex items-center justify-between text-sm">
            <div>
              <p className="text-xs text-muted-foreground">{p.milestone.replace(/_/g, " ")}</p>
              <p className="font-semibold">{formatCurrency(p.amount)}</p>
            </div>
            <Badge variant={p.status === "PAID" ? "success" : "warning"} className="text-[10px]">
              {p.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}