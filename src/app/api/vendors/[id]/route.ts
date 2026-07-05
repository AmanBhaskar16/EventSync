
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const vendor = await prisma.vendor.findUnique({
      where: { id, isActive: true, kycStatus: "APPROVED" },
      select: {
        id: true, 
        businessName: true, 
        category: true, 
        description: true,
        city: true, 
        state: true, 
        pincode: true, 
        serviceRadius: true,
        isVerified: true, 
        kycStatus: true, 
        avgRating: true,
        totalReviews: true, 
        totalBookings: true, 
        responseTime: true,
        tier: true, 
        portfolioImages: true, 
        createdAt: true,
        user: { 
          select: { 
            name: true, 
            avatar: true, 
            createdAt: true 
          } 
        },
        services: {
          where:   { isActive: true },
          orderBy: { basePrice: "asc" },
          select: {
            id: true, 
            name: true, 
            description: true, 
            basePrice: true, 
            unit: true,
            serviceAddons : { 
              select: { 
                id: true, 
                name: true, 
                price: true 
              } 
            },
          },
        },
        reviews: {
          where:   { 
            isPublic: true, 
            isFlagged: false 
          },
          orderBy: { createdAt: "desc" },
          take:    10,
          select: {
            id: true, 
            reviewerName: true, 
            overallRating: true, 
            comment: true,
            vendorReply: true, 
            createdAt: true,
            punctuality: true, 
            quality: true, 
            communication: true,
            value: true, 
            professionalism: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { success: false, 
          error: "Vendor not found." 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: vendor 
    });
  } catch (err) {
    console.error("[VENDOR_PROFILE]", err);
    return NextResponse.json(
      { success: false, 
        error: "Failed to load vendor." 
      },
      { status: 500 }
    );
  }
}