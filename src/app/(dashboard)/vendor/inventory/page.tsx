import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVendorInventory } from "./_queries";
import { InventoryItemCard } from "./_components/inventory-item-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inventory" };

const InventoryPage = async () => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const items = await getVendorInventory(session.user.id);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} item{items.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button asChild>
          <Link href="/vendor/inventory/new"><Plus className="size-4" /> Add Item</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <Package className="size-12 mx-auto text-muted-foreground opacity-30" />
          <p className="font-medium text-lg">No inventory items yet</p>
          <p className="text-sm text-muted-foreground">Add chairs, tables, equipment, or any reusable resource.</p>
          <Button asChild><Link href="/vendor/inventory/new">Add your first item</Link></Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => <InventoryItemCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}

export default InventoryPage;