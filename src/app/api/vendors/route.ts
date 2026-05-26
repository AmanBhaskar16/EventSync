// URL: GET /api/vendors
// Query params: q, category, city, minRating, minPrice, maxPrice, sortBy, page

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const q         = searchParams.get("q")?.trim()        ?? "";
    const category  = searchParams.get("category")         ?? "";
    const city      = searchParams.get("city")?.trim()     ?? "";
    const minRating = parseFloat(searchParams.get("minRating") ?? "0");
    const minPrice  = parseFloat(searchParams.get("minPrice")  ?? "0");
    const maxPrice  = parseFloat(searchParams.get("maxPrice")  ?? "0");
    const sortBy    = searchParams.get("sortBy")            ?? "rating";
    const page      = Math.max(1, parseInt(searchParams.get("page") ?? "1"));

    // Build where clause
    const where: Record<string, unknown> = {
      isActive:  true,
      kycStatus: "APPROVED",
    };

    if (category) where.category = category;
    if (city)     where.city = { contains: city, mode: "insensitive" };
    if (minRating > 0) where.avgRating = { gte: minRating };
    if (q) {
      where.OR = [
        { businessName: { contains: q, mode: "insensitive" } },
        { description:  { contains: q, mode: "insensitive" } },
        { city:         { contains: q, mode: "insensitive" } },
      ];
    }
    if (minPrice > 0 || maxPrice > 0) {
      const priceFilter: Record<string, number> = {};
      if (minPrice > 0) priceFilter.gte = minPrice;
      if (maxPrice > 0) priceFilter.lte = maxPrice;
      where.services = { 
        some: { 
          basePrice: priceFilter, 
          isActive: true 
        } 
      };
    }

    const orderBy: Record<string, "asc" | "desc"> =
      sortBy === "bookings" ? { totalBookings: "desc" }
      : sortBy === "price"  ? { avgRating: "desc" }
      :                       { avgRating: "desc" };

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        select: {
          id: true, 
          businessName: true, 
          category: true, 
          description: true,
          city: true, 
          state: true, 
          avgRating: true, 
          totalReviews: true,
          totalBookings: true, 
          responseTime: true, 
          isVerified: true,
          tier: true, 
          portfolioImages: true,
          services: {
            where:   { isActive: true },
            orderBy: { basePrice: "asc" },
            take:    3,
            select:  { 
              id: true, 
              name: true, 
              basePrice: true, 
              unit: true 
            },
          },
        },
        orderBy,
        take:  PAGE_SIZE,
        skip:  (page - 1) * PAGE_SIZE,
      }),
      prisma.vendor.count({ where }),
    ]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return NextResponse.json({
      success: true,
      data: {
        vendors,
        pagination: {
          total, 
          page, 
          pageSize: PAGE_SIZE, 
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (err) {
    console.error("[VENDORS_SEARCH]", err);
    return NextResponse.json(
      { success: false, 
        error: "Failed to fetch vendors." 
      },
      { status: 500 }
    );
  }
}