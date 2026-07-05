import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InventoryEditForm } from "@/components/inventory/inventory-edit-form";
import { AvailabilityChecker } from "@/components/inventory/availability-checker";
import { getStockInfo } from "@/lib/inventory/inventory";
import { getInventoryItemDetail } from "./_queries";
import { ItemHeader } from "./_components/item-header";
import { StockOverviewCard } from "./_components/stock-overview-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inventory Item" };

const InventoryItemPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const item = await getInventoryItemDetail(id, session.user.id);
  const stock = getStockInfo(
    item.totalQuantity, 
    item.maintenanceQty, 
    item.lowStockAlert
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/vendor/inventory"><ArrowLeft className="size-4" /> All items</Link>
        </Button>
      </div>

      <ItemHeader item={item} isLow={stock.isLow} />

      <StockOverviewCard item={item} stock={stock} />

      <AvailabilityChecker itemId={id} unit={item.unit} />

      <InventoryEditForm
        itemId={id}
        initialData={{
          name: item.name,
          description: item.description,
          totalQuantity: item.totalQuantity,
          unit: item.unit,
          isReusable: item.isReusable,
          lowStockAlert: item.lowStockAlert,
          maintenanceQty: item.maintenanceQty,
        }}
      />
    </div>
  );
}

export default InventoryItemPage;