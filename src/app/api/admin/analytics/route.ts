
// GET — platform-wide analytics

import {  NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ 
        success: false, 
        error: "Admin only." 
      }, { status: 403 });
    }

    const now  = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth  = new Date(now.getFullYear(), now.getMonth() - 1, 1);
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
      bookingsByStatus,
    ] = await Promise.all([

      prisma.vendor.count(),

      prisma.vendor.count({ 
        where: { kycStatus: "APPROVED" } 
      }),

      prisma.vendor.count({ 
        where: { kycStatus: "PENDING" } 
      }),

      prisma.customer.count(),

      prisma.booking.count(),

      prisma.booking.count({ 
        where: { 
          status: { 
            in: ["CONFIRMED","IN_PROGRESS","QUOTE_SENT","NEGOTIATION","INQUIRY"] 
          } 
        } 
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
        take:    8,
        select: {
          id: true, 
          status: true, 
          agreedPrice: true, 
          createdAt: true,
          vendor: { 
            select: { businessName: true } 
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
        take:    5,
        select: {
          id: true, 
          businessName: true, 
          category: true,
          totalBookings: true, 
          avgRating: true, 
          totalReviews: true,
        },
      }),

      prisma.booking.groupBy({
        by:     ["status"],
        _count: { status: true },
      }),
    ]);

    const gmv = Number((totalGMV._sum as { amount?: number }).amount   ?? 0);
    const mGMV = Number((monthGMV._sum as { amount?: number }).amount   ?? 0);
    const lmGMV = Number((lastMonthGMV._sum as { amount?: number }).amount ?? 0);
    const gmvGrowth = lmGMV > 0 ? (((mGMV - lmGMV) / lmGMV) * 100).toFixed(1) : null;

    return NextResponse.json({
      success: true,
      data: {
        vendors:       { total: totalVendors, approved: approvedVendors, pendingKYC },
        customers:     { total: totalCustomers },
        bookings:      { total: totalBookings, active: activeBookings, byStatus: bookingsByStatus },
        revenue:       { totalGMV: gmv, monthGMV: mGMV, lastMonthGMV: lmGMV, growth: gmvGrowth },
        disputes:      { open: openDisputes },
        reviews:       { total: totalReviews },
        recentBookings,
        topVendors,
      },
    });
  } catch (err) {
    console.error("[ADMIN_ANALYTICS]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch analytics." }, { status: 500 });
  }
}