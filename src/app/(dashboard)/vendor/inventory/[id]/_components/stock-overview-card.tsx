
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StockInfo } from "@/lib/inventory/inventory";
import type { InventoryItemDetail } from "../_queries";

export const StockOverviewCard = ({ item, stock }: { item: InventoryItemDetail; stock: StockInfo }) => {
  const { available, pct, isLow, barColor } = stock;

  const stats = [
    { label: "Total", value: `${item.totalQuantity} ${item.unit}` },
    { label: "Available", value: `${available} ${item.unit}`, highlight: isLow },
    { label: "Maintenance", value: `${item.maintenanceQty} ${item.unit}` },
  ];

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Stock Overview</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          {stats.map(({ label, value, highlight }) => (
            <div key={label} className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-lg font-bold mt-0.5 ${highlight ? "text-amber-600" : ""}`}>{value}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Availability</span><span>{pct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Alert when below {item.lowStockAlert} {item.unit}</p>
      </CardContent>
    </Card>
  );
}