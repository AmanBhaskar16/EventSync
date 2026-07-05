
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VendorDashboardData } from "../_queries";

export const PerformanceCard = ({ vendor, completedCount, pendingCount }: {
  vendor: VendorDashboardData["vendor"];
  completedCount: number;
  pendingCount: number;
}) => {
  const rows = [
    { label: "Total bookings received", value: vendor.totalBookings },
    { label: "Completed events", value: completedCount },
    { label: "Pending inquiries", value: pendingCount },
    { label: "Avg response time", value: `${vendor.responseTime}h` },
    { label: "Total reviews", value: vendor.totalReviews },
  ];

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Performance</CardTitle></CardHeader>
      <CardContent className="pt-0 space-y-4">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}