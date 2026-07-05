
import { prisma } from "@/lib/db/prisma";
import { notFound, redirect } from "next/navigation";

export const getInventoryItemDetail = async (itemId: string, userId: string) => {
  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
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
    where: { userId },
    select: { id: true },
  });

  if (vendor?.id !== item.vendorId) redirect("/vendor/inventory");

  return item;
}

export type InventoryItemDetail = Awaited<ReturnType<typeof getInventoryItemDetail>>;