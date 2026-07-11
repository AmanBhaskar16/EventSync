
// POST — customer submits a review after booking is completed

import { NextRequest, NextResponse } from "next/server";
import { auth }   from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });

    if (session.user.role !== "CUSTOMER") return NextResponse.json({ 
      success: false, 
      error: "Customers only." 
    }, { status: 403 });

    const body = await req.json() as {
      bookingId: string;
      punctuality: number;
      quality: number;
      communication: number;
      value: number;
      professionalism: number;
      comment?: string;
    };

    const { bookingId, punctuality, quality, communication, value, professionalism, comment } = body;

    if (!bookingId) return NextResponse.json({ 
      success: false, 
      error: "bookingId required." 
    }, { status: 400 });

    // Validate ratings
    const ratings = [punctuality, quality, communication, value, professionalism];
    if (ratings.some((r) => !r || r < 1 || r > 5)) {
      return NextResponse.json({ 
        success: false, 
        error: "All ratings must be between 1 and 5." 
      }, { status: 400 });
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where:  { id: bookingId },
      select: {
        id: true, status: true, vendorId: true,
        event: { 
          select: { 
            customer: { 
              select: { 
                id: true, 
                userId: true, 
                user: { 
                  select: { 
                    name: true 
                  } 
                } 
              } 
            } 
          } 
        },
      },
    });
    if (!booking) return NextResponse.json({ 
      success: false, 
      error: "Booking not found." 
    }, { status: 404 });

    const b  = booking as Record<string, unknown>;
    const event  = b.event  as Record<string, unknown>;
    const custR  = event.customer as Record<string, unknown>;
    const custUser = custR.user as Record<string, unknown>;

    if (session.user.id !== custR.userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied." 
      }, { status: 403 });
    }
    if (b.status !== "COMPLETED") {
      return NextResponse.json({ 
        success: false, 
        error: "Can only review completed bookings." 
      }, { status: 400 });
    }

    // Check duplicate
    const existing = await prisma.review.findUnique({ where: { bookingId }, select: { id: true } });
    if (existing) return NextResponse.json({ 
      success: false, 
      error: "You already reviewed this booking." 
    }, { status: 409 });

    const overallRating = parseFloat(
      ((punctuality + quality + communication + value + professionalism) / 5).toFixed(1)
    );

    const review = await prisma.review.create({
      data: {
        bookingId,
        customerId: custR.id as string,
        vendorId: b.vendorId as string,
        reviewerName: (custUser.name as string) ?? "Customer",
        punctuality,
        quality,
        communication,
        value,
        professionalism,
        overallRating,
        comment: comment?.trim() ?? null,
      },
    });

    // Update vendor avgRating
    const allReviews = await prisma.review.aggregate({
      where: { 
        vendorId: b.vendorId as string, 
        isPublic: true },
      _avg:  { overallRating: true },
      _count: true,
    });
    const agg = allReviews as Record<string, unknown>;
    const avg = (agg._avg as Record<string, number | null>).overallRating ?? 0;
    const cnt = agg._count as number;

    await prisma.vendor.update({
      where: { id: b.vendorId as string },
      data:  { 
        avgRating: avg, 
        totalReviews: cnt 
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: review, 
      message: "Review submitted!" 
    }, { status: 201 });

  } catch (err) {
    console.error("[CREATE_REVIEW]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to submit review." 
    }, { status: 500 });
  }
}