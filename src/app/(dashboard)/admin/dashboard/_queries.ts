
import { prisma } from "@/lib/db/prisma";

export const getAdminDashboardData = async () =>{
  const [
    totalVendors, 
    pendingKYC, 
    totalCustomers, 
    totalBookings,
    activeDisputes, 
    pendingVendors, 
    openDisputes, 
    gmvResult,
  ] = await Promise.all([
    prisma.vendor.count(), 

    prisma.vendor.count({ where: { kycStatus: "PENDING" } }),

    prisma.customer.count(),

    prisma.booking.count(),

    prisma.dispute.count({ where: { status: "OPEN" } }),

    prisma.vendor.findMany({
      where: { kycStatus: "PENDING" },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    prisma.dispute.findMany({
      where: { status: "OPEN" },
      include: { 
        booking: { 
          include: { 
            vendor: { 
              select: { businessName: true } 
            } 
          } 
        } 
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    prisma.payment.aggregate({ 
      where: { status: "PAID" }, 
      _sum: { amount: true } 
    }),
  ]);

  return {
    totalVendors,
    pendingKYC,
    totalCustomers,
    totalBookings,
    activeDisputes,
    pendingVendors,
    openDisputes,
    totalGMV: Number(gmvResult._sum.amount ?? 0),
  };
}

export type AdminDashboardData = Awaited<ReturnType<typeof getAdminDashboardData>>;