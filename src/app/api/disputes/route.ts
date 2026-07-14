
// POST — raise a dispute on a completed booking

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

    const body = await req.json() as {
      bookingId: string;
      reason: string;
      description: string;
    };
    const { bookingId, reason, description } = body;

    if (!bookingId || !reason?.trim() || !description?.trim()) {
        return NextResponse.json({ 
            success: false, 
            error: "bookingId, reason and description required." 
        }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where:  { id: bookingId },
      select: {
        id: true, 
        status: true,
        event:  { 
            select: { 
                customer: { 
                    select: { 
                        userId: true 
                    } 
                } 
            } 
        },
        vendor: { 
            select: { 
                userId: true 
            } 
        },
      },
    });
    if (!booking) return NextResponse.json({ success: false, error: "Booking not found." }, { status: 404 });

    const b  = booking as Record<string, unknown>;
    const event  = b.event  as Record<string, unknown>;
    const custR  = event.customer  as Record<string, unknown>;
    const vendR  = b.vendor as Record<string, unknown>;

    const isCustomer = session.user.id === custR.userId;
    const isVendor = session.user.id === vendR.userId;
    if (!isCustomer && !isVendor) return NextResponse.json({ 
        success: false, 
        error: "Access denied." 
    }, { status: 403 });

    if (!["COMPLETED","CONFIRMED","IN_PROGRESS"].includes(b.status as string)) {
        return NextResponse.json({ 
            success: false, 
            error: "Can only dispute confirmed or completed bookings." 
        }, { status: 400 });
    }

    const existing = await prisma.dispute.findUnique({ 
        where: { bookingId }, 
        select: { id: true } 
    });
    if (existing) return NextResponse.json({ 
        success: false, 
        error: "A dispute already exists for this booking." 
    }, { status: 409 });

    const dispute = await prisma.dispute.create({
      data: {
        bookingId,
        raisedBy:    session.user.id,
        reason:      reason.trim(),
        description: description.trim(),
        status:      "OPEN",
      },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data:  { status: "DISPUTED" },
    });

    return NextResponse.json({ 
        success: true, 
        data: dispute, 
        message: "Dispute raised." 
    }, { status: 201 });
  } catch (err) {
    console.error("[CREATE_DISPUTE]", err);
    return NextResponse.json({ 
        success: false, 
        error: "Failed to raise dispute." 
    }, { status: 500 });
  }
}