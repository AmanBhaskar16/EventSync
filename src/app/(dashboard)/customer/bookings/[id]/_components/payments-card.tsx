
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CustomerBookingDetail } from "../_queries";

const MILESTONE_LABELS: Record<string, string> = {
  BOOKING_CONFIRMATION: "Booking Confirmation (30%)",
  PRE_EVENT: "Pre-Event Payment (40%)",
  POST_EVENT: "Post-Event Settlement (30%)",
};

const PAYMENT_BADGE_VARIANT: Record<string, "success" | "destructive" | "warning"> = {
  PAID: "success",
  FAILED: "destructive",
};

export const PaymentsCard = ({ payments }: { payments: CustomerBookingDetail["payments"] }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="size-4 text-muted-foreground" /> Payments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {payments.length === 0 ? (
          <p className="text-xs text-muted-foreground">Payment schedule will appear once the quote is accepted.</p>
        ) : (
          payments.map((p) => (
            <div key={p.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{MILESTONE_LABELS[p.milestone] ?? p.milestone}</span>
                <Badge variant={PAYMENT_BADGE_VARIANT[p.status] ?? "warning"} className="text-[10px]">{p.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{formatCurrency(p.amount)}</span>
                {p.paidAt && <span className="text-[10px] text-muted-foreground">{formatDate(p.paidAt)}</span>}
              </div>
              {p.status === "PENDING" && <Button size="sm" className="w-full mt-1 h-8 text-xs">Pay now</Button>}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}