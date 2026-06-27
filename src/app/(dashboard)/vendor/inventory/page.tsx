
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Plus, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge }  from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inventory" };

export default async function InventoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const vendor = await prisma.vendor.findUnique({
    where:  { userId: session.user.id },
    select: { id: true },
  });
  if (!vendor) redirect("/vendor/dashboard");

  const items = await prisma.inventoryItem.findMany({
    where:   { vendorId: (vendor as { id: string }).id },
    orderBy: { name: "asc" },
    select: {
      id: true, 
      name: true, 
      description: true,
      totalQuantity: true, 
      maintenanceQty: true,
      unit: true, 
      lowStockAlert: true, 
      isReusable: true,
    },
  });

  type Item = typeof items[number];

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
          <Link href="/vendor/inventory/new">
            <Plus className="size-4" /> 
            Add Item
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <Package className="size-12 mx-auto text-muted-foreground opacity-30" />
          <p className="font-medium text-lg">No inventory items yet</p>
          <p className="text-sm text-muted-foreground">
            Add chairs, tables, equipment, or any reusable resource.
          </p>
          <Button asChild>
            <Link href="/vendor/inventory/new">Add your first item</Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(items as Item[]).map((item) => {
            const available = item.totalQuantity - item.maintenanceQty;
            const pct       = item.totalQuantity > 0
              ? Math.round((available / item.totalQuantity)*100) : 0;
            const isLow = available <= item.lowStockAlert;
            const barColor = pct > 50 ? "bg-green-500" : pct > 20 ? "bg-amber-500" : "bg-red-500";

            return (
              <Link key={item.id} href={`/vendor/inventory/${item.id}`}>
                <Card className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer h-full">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {isLow && (
                        <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Available</span>
                        <span className="font-medium">
                          {available}/{item.totalQuantity} {item.unit}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${pct}%`}}
                        />
                      </div>
                      {item.maintenanceQty > 0 && (
                        <p className="text-[10px] text-muted-foreground">
                          {item.maintenanceQty} {item.unit} under maintenance
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Badge variant={item.isReusable ? "success" : "secondary"} className="text-[10px]">
                        {item.isReusable ? "Reusable" : "Single-use"}
                      </Badge>
                      {isLow && (
                        <Badge variant="warning" className="text-[10px]">Low stock</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}