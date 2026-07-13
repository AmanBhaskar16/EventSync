
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsData } from "../_queries";

export const PlatformHealthCard = ({
  totalBookings,
  activeBookings,
  pendingKYC,
  openDisputes,
  totalReviews,
}: Pick<AnalyticsData, "totalBookings" | "activeBookings" | "pendingKYC" | "openDisputes" | "totalReviews">) => {
  const rows = [
    { label: "Total Bookings", value: totalBookings  },
    { label: "Active Bookings", value: activeBookings  },
    { label: "Pending KYC", value: pendingKYC     },
    { label: "Open Disputes", value: openDisputes   },
    { label: "Total Reviews", value: totalReviews   },
  ];

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Platform Health</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}