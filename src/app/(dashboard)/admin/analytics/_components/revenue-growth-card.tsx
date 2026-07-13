
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { AnalyticsData } from "../_queries";

export const RevenueGrowthCard = ({ gmv, mGMV, lmGMV, growth, isUp }: Pick<AnalyticsData, "gmv" | "mGMV" | "lmGMV" | "growth" | "isUp">) => {
  const rows = [
    { label: "This Month", value: formatCurrency(mGMV)  },
    { label: "Last Month", value: formatCurrency(lmGMV) },
    { label: "All Time",   value: formatCurrency(gmv)   },
  ];

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Revenue Growth</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold">{value}</span>
          </div>
        ))}
        {growth !== null && (
          <div className={`flex items-center gap-2 rounded-lg p-3 text-sm font-medium ${isUp ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {isUp
              ? <TrendingUp  className="size-4" />
              : <TrendingDown className="size-4" />
            }
            {Math.abs(growth).toFixed(1)}% {isUp ? "growth" : "decline"} vs last month
          </div>
        )}
      </CardContent>
    </Card>
  );
}