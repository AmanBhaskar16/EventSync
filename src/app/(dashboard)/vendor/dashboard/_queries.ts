
import { prisma } from "@/lib/db/prisma";

export const getVendorDashboardData = async (userId: string) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    include: {
      bookings: {
        include: { 
          event: { 
            select: { 
              id: true, 
              title: true, 
              eventDate: true, 
              city: true, 
              type: true 
            } 
          } 
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      inventoryItems: { orderBy: { name: "asc" }, take: 6 },
    },
  });

  if (!vendor) return null;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  const confirmed = vendor.bookings.filter((b) => b.status === "CONFIRMED");
  const completed = vendor.bookings.filter((b) => b.status === "COMPLETED");
  const pending = vendor.bookings.filter((b) => ["INQUIRY", "QUOTE_SENT", "NEGOTIATION"].includes(b.status));
  const upcoming = vendor.bookings.filter((b) => b.status === "CONFIRMED" && new Date(b.event.eventDate) > now);

  const earned = [...confirmed, ...completed];
  const totalRevenue = earned.reduce((sum, b) => sum + (b.agreedPrice ?? 0), 0);
  const monthRevenue = earned.filter((b) => new Date(b.createdAt) >= monthStart).reduce((sum, b) => sum + (b.agreedPrice ?? 0), 0);
  const weekRevenue = earned.filter((b) => new Date(b.createdAt) >= weekStart).reduce((sum, b) => sum + (b.agreedPrice ?? 0), 0);

  return { vendor, pending, upcoming, completed, totalRevenue, monthRevenue, weekRevenue };
}

export type VendorDashboardData = NonNullable<Awaited<ReturnType<typeof getVendorDashboardData>>>;