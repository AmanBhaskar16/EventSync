
// POST — reset PROCESSING payment back to PENDING so user can retry

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });

    const body = await req.json() as { 
      bookingId: string; 
      milestone: string 
    };

    const { bookingId, milestone } = body;

    // Verify customer owns this booking
    const booking = await prisma.booking.findUnique({
      where:  { id: bookingId },
      select: { 
        event: { 
          select: { 
            customer: { 
              select: { 
                userId: true 
              } 
            } 
          } 
        } 
      },
    });

    if (!booking) return NextResponse.json({ 
      success: false, 
      error: "Booking not found." 
    }, { status: 404 });

    const b     = booking as Record<string, unknown>;
    const event = b.event as Record<string, unknown>;
    const custR = event.customer as Record<string, unknown>;

    if (session.user.id !== custR.userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied." 
      }, { status: 403 });
    }

    // Reset PROCESSING → PENDING
    await prisma.payment.updateMany({
      where: {
        bookingId,
        milestone: milestone as "BOOKING_CONFIRMATION" | "PRE_EVENT" | "POST_EVENT",
        status:    "PROCESSING",
      },
      data: { status: "PENDING", razorpayOrderId: null },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[RESET_PAYMENT]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to reset payment." 
    }, { status: 500 });
  }
}