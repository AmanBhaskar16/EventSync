import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InventoryEditForm } from "@/components/inventory/inventory-edit-form";
import { AvailabilityChecker } from "@/components/inventory/availability-checker";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inventory Item" };

export default async function InventoryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const item = await prisma.inventoryItem.findUnique({
    where:  { id },
    select: {
      id: true, 
      vendorId: true, 
      name: true, 
      description: true,
      totalQuantity: true, 
      maintenanceQty: true, 
      unit: true,
      isReusable: true, 
      lowStockAlert: true, 
      createdAt: true,
    },
  });
  if (!item) notFound();

  const vendor = await prisma.vendor.findUnique({
    where:  { userId: session.user.id },
    select: { id: true },
  });

  const i = item as Record<string, unknown>;

  const v = vendor as { id: string } | null;

  if (v?.id !== i.vendorId) redirect("/vendor/inventory");

  const available = (i.totalQuantity as number) - (i.maintenanceQty as number);

  const pct       = (i.totalQuantity as number) > 0
    ? Math.round((available / (i.totalQuantity as number)) * 100) : 0;

  const isLow     = available <= (i.lowStockAlert as number);

  const barColor  = pct > 50 ? "bg-green-500" : pct > 20 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/vendor/inventory"><ArrowLeft className="size-4" /> All items</Link>
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{i.name as string}</h1>
          {(i.description as string | null) && (
            <p className="text-sm text-muted-foreground mt-1">{i.description as string}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Badge variant={(i.isReusable as boolean) ? "success" : "secondary"} className="text-xs">
            {(i.isReusable as boolean) ? "Reusable" : "Single-use"}
          </Badge>
          {isLow && (
            <Badge variant="warning" className="text-xs flex items-center gap-1">
              <AlertTriangle className="size-3" /> 
              Low stock
            </Badge>
          )}
        </div>
      </div>

      {/* Stock overview */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Stock Overview</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Total",       value: `${i.totalQuantity} ${i.unit}` },
              { label: "Available",   value: `${available} ${i.unit}`,highlight: isLow },
              { label: "Maintenance", value: `${i.maintenanceQty} ${i.unit}` },
            ].map(({ label, value, highlight }) => (
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
          <p className="text-xs text-muted-foreground">
            Alert when below {i.lowStockAlert as number} {i.unit as string}
          </p>
        </CardContent>
      </Card>

      {/* Availability checker */}
      <AvailabilityChecker itemId={id} unit={i.unit as string} />

      {/* Edit form */}
      <InventoryEditForm
        itemId={id}
        initialData={{
          name:           i.name           as string,
          description:    i.description    as string | null,
          totalQuantity:  i.totalQuantity  as number,
          unit:           i.unit           as string,
          isReusable:     i.isReusable     as boolean,
          lowStockAlert:  i.lowStockAlert  as number,
          maintenanceQty: i.maintenanceQty as number,
        }}
      />
    </div>
  );
}