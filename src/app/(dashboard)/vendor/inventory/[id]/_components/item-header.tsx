
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import type { InventoryItemDetail } from "../_queries";

export const ItemHeader = ({ item, isLow }: { item: InventoryItemDetail; isLow: boolean }) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{item.name}</h1>
        {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
      </div>
      <div className="flex gap-2">
        <Badge variant={item.isReusable ? "success" : "secondary"} className="text-xs">
          {item.isReusable ? "Reusable" : "Single-use"}
        </Badge>
        {isLow && (
          <Badge variant="warning" className="text-xs flex items-center gap-1">
            <AlertTriangle className="size-3" /> Low stock
          </Badge>
        )}
      </div>
    </div>
  );
}