
// PATCH — mark vendor payout as completed

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ 
        success: false, 
        error: "Admin only." 
      }, { status: 403 });
    }

    const { bookingId }  = await params;
    const body = await req.json() as { vendorPayout: number };
    const { vendorPayout } = body;

    if (!vendorPayout || vendorPayout <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid payout amount." 
      }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where:  { id: bookingId },
      select: { 
        id: true, 
        status: true 
      },
    });
    if (!booking) return NextResponse.json({ 
      success: false, 
      error: "Booking not found." 
    }, { status: 404 });

    await prisma.booking.update({
      where: { id: bookingId },
      data:  { vendorPayout },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Payout marked as completed." 
    });
  } catch (err) {
    console.error("[MARK_PAYOUT]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update payout." 
    }, { status: 500 });
  }
}