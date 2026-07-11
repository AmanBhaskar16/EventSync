
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VendorBookingDetail } from "../_queries";

export function CustomerInfoCard({
  customer,
  description,
  specialRequests,
}: {
  customer: VendorBookingDetail["event"]["customer"];
  description: string | null;
  specialRequests: string | null;
}) {
  const user = customer.user;

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Customer</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
            {(user.name ?? "C").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm">{user.name ?? "Customer"}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            {user.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
          </div>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed pt-1 border-t border-border">
            {description}
          </p>
        )}
        {specialRequests && (
          <div className="pt-1 space-y-1 border-t border-border">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Special requests
            </p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{specialRequests}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}