
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";

export const getVendorInventory = async (userId: string) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!vendor) redirect("/vendor/dashboard");

  const items = await prisma.inventoryItem.findMany({
    where: { vendorId: vendor.id },
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

  return items;
}

export type InventoryListItem = Awaited<ReturnType<typeof getVendorInventory>>[number];