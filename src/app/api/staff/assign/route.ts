
// POST — assign staff member to a booking

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
      staffMemberId: string; bookingId: string; date: string; notes?: string;
    };
    const { staffMemberId, bookingId, date, notes } = body;

    if (!staffMemberId || !bookingId || !date) {
      return NextResponse.json({ 
        success: false, 
        error: "staffMemberId, bookingId and date are required." 
      }, { status: 400 });
    }

    // Verify ownership
    const member = await prisma.staffMember.findUnique({ 
      where: { id: staffMemberId }, 
      select: { vendorId: true } 
    });

    if (!member) return NextResponse.json({ 
      success: false, 
      error: "Staff member not found." 
    }, { status: 404 });

    const vendor = await prisma.vendor.findUnique({ 
      where: { userId: session.user.id }, 
      select: { id: true } 
    });

    const v = vendor as { id: string } | null;
    const m = member as Record<string, unknown>;
    
    if (v?.id !== m.vendorId) return NextResponse.json({ 
      success: false, 
      error: "Access denied." 
    }, { status: 403 });

    const assignment = await prisma.staffAssignment.create({
      data: {
        staffMemberId,
        bookingId,
        date:  new Date(date),
        notes: notes?.trim() ?? null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: assignment, 
      message: "Staff assigned." 
    }, { status: 201 });

  } catch (err) {

    console.error("[ASSIGN_STAFF]", err);

    return NextResponse.json({ 
      success: false, 
      error: "Failed to assign staff." 
    }, { status: 500 });
  }
}