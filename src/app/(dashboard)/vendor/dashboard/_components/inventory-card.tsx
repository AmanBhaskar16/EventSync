
import Link from "next/link";
import { CardShell } from "@/components/dashboard/card-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import type { VendorDashboardData } from "../_queries";

export const InventoryCard = ({ items }: { items: VendorDashboardData["vendor"]["inventoryItems"] }) => {
  return (
    <CardShell title="Inventory" viewAllHref="/vendor/inventory">
      {items.length === 0 ? (
        <EmptyState icon={Package} message="No inventory items added yet" action={{ label: "Add inventory", href: "/vendor/inventory/new" }} />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const available = item.totalQuantity - item.maintenanceQty;
            const pct = item.totalQuantity > 0 ? Math.round((available / item.totalQuantity) * 100) : 0;
            const barColor = pct > 50 ? "bg-green-500" : pct > 20 ? "bg-amber-500" : "bg-red-500";
            const textColor = pct > 50 ? "text-green-600" : pct > 20 ? "text-amber-600" : "text-red-600";
            const label = pct > 50 ? "Good" : pct > 20 ? "Low" : "Critical";
            return (
              <div key={item.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate">{item.name}</span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-xs text-muted-foreground">{available}/{item.totalQuantity} {item.unit}</span>
                    <span className={`text-[10px] font-semibold ${textColor}`}>{label}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          <Button variant="ghost" size="sm" className="w-full mt-1" asChild>
            <Link href="/vendor/inventory">View all inventory</Link>
          </Button>
        </div>
      )}
    </CardShell>
  );
}