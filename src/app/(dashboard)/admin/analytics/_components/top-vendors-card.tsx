
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VENDOR_CATEGORY_LABELS } from "@/lib/utils";
import type { AnalyticsData } from "../_queries";

export const TopVendorsCard = ({ vendors }: { vendors: AnalyticsData["topVendors"] }) => {
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Top Vendors</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {vendors.map((v, i) => (
          <div key={v.id} className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{v.businessName}</p>
              <p className="text-xs text-muted-foreground">
                {VENDOR_CATEGORY_LABELS[v.category] ?? v.category}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-semibold">{v.totalBookings} bookings</p>
              {v.avgRating > 0 && (
                <p className="text-xs text-amber-600 flex items-center gap-0.5 justify-end">
                  <Star className="size-3 fill-amber-400 text-amber-400" />{v.avgRating.toFixed(1)}
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}