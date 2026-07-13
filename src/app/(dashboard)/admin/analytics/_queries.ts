
import { prisma } from "@/lib/db/prisma";

export async function getAnalyticsData() {
  const now          = new Date();
  const monthStart   = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth    = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalVendors,
    approvedVendors,
    pendingKYC,
    totalCustomers,
    totalBookings,
    activeBookings,
    totalGMV,
    monthGMV,
    lastMonthGMV,
    openDisputes,
    totalReviews,
    recentBookings,
    topVendors,
  ] = await Promise.all([
    prisma.vendor.count(),
    prisma.vendor.count({ where: { kycStatus: "APPROVED" } }),
    prisma.vendor.count({ where: { kycStatus: "PENDING" } }),
    prisma.customer.count(),
    prisma.booking.count(),
    prisma.booking.count({
      where: { 
        status: { 
          in: ["CONFIRMED", "IN_PROGRESS", "QUOTE_SENT", "NEGOTIATION", "INQUIRY"] 
        } 
      },
    }),
    prisma.payment.aggregate({ 
      where: { status: "PAID" }, 
      _sum: { amount: true } 
    }),
    prisma.payment.aggregate({ 
      where: { 
        status: "PAID", 
        paidAt: { gte: monthStart } 
      }, 
      _sum: { amount: true } 
    }),
    prisma.payment.aggregate({ 
      where: { 
        status: "PAID", 
        paidAt: { gte: lastMonth, lte: lastMonthEnd } 
      }, 
      _sum: { amount: true } 
    }),
    prisma.dispute.count({ 
      where: { status: "OPEN" } 
    }),
    prisma.review.count(),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true, 
        status: true, 
        agreedPrice: true, 
        createdAt: true,
        vendor: { 
          select: { 
            businessName: true 
          } 
        },
        event:  { 
          select: { 
            title: true, 
            eventDate: true 
          } 
        },
      },
    }),
    prisma.vendor.findMany({
      where:   { kycStatus: "APPROVED" },
      orderBy: { totalBookings: "desc" },
      take: 5,
      select: {
        id: true, 
        businessName: true, 
        category: true,
        totalBookings: true, 
        avgRating: true, 
        totalReviews: true,
      },
    }),
  ]);

  const gmv = Number(totalGMV._sum.amount ?? 0);
  const mGMV  = Number(monthGMV._sum.amount ?? 0);
  const lmGMV = Number(lastMonthGMV._sum.amount ?? 0);
  const growth = lmGMV > 0 ? ((mGMV - lmGMV) / lmGMV) * 100 : null;

  return {
    // counts
    totalVendors,
    approvedVendors,
    pendingKYC,
    totalCustomers,
    totalBookings,
    activeBookings,
    openDisputes,
    totalReviews,
    // revenue
    gmv,
    mGMV,
    lmGMV,
    growth,
    isUp: growth !== null && growth >= 0,
    // lists
    recentBookings,
    topVendors,
  };
}

export type AnalyticsData = Awaited<ReturnType<typeof getAnalyticsData>>;