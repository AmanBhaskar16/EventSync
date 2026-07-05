
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { getStockInfo } from "@/lib/inventory/inventory";
import type { InventoryListItem } from "../_queries";

export const InventoryItemCard = ({ item }: { item: InventoryListItem }) => {
  const { available, pct, isLow, barColor } = getStockInfo(item.totalQuantity, item.maintenanceQty, item.lowStockAlert);

  return (
    <Link href={`/vendor/inventory/${item.id}`}>
      <Card className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer h-full">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{item.name}</p>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
              )}
            </div>
            {isLow && <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Available</span>
              <span className="font-medium">{available}/{item.totalQuantity} {item.unit}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
            {item.maintenanceQty > 0 && (
              <p className="text-[10px] text-muted-foreground">{item.maintenanceQty} {item.unit} under maintenance</p>
            )}
          </div>

          <div className="flex gap-2">
            <Badge variant={item.isReusable ? "success" : "secondary"} className="text-[10px]">
              {item.isReusable ? "Reusable" : "Single-use"}
            </Badge>
            {isLow && <Badge variant="warning" className="text-[10px]">Low stock</Badge>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}