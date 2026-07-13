
// PATCH — admin resolves a dispute

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ 
        success: false, 
        error: "Admin only." 
      }, { status: 403 });
    }

    const { id } = await params;
    const body   = await req.json() as {
      status: "RESOLVED_CUSTOMER" | "RESOLVED_VENDOR" | "CLOSED";
      resolution: string;
    };
    const { status, resolution } = body;

    if (!resolution?.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: "Resolution note is required." 
      }, { status: 400 });
    }

    const dispute = await prisma.dispute.findUnique({
      where:  { id },
      select: { 
        id: true, 
        bookingId: true 
      },
    });
    if (!dispute) return NextResponse.json({ 
      success: false, 
      error: "Dispute not found." 
    }, { status: 404 });

    const d = dispute as { 
      id: string; 
      bookingId: string 
    };

    await prisma.$transaction(async (tx) => {
      await tx.dispute.update({
        where: { id },
        data: {
          status,
          resolution: resolution.trim(),
          resolvedBy: session.user.id,
          resolvedAt: new Date(),
        },
      });
      // Revert booking to COMPLETED after dispute resolved
      await tx.booking.update({
        where: { id: d.bookingId },
        data:  { status: "COMPLETED" },
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: "Dispute resolved." 
    });
  } catch (err) {
    console.error("[RESOLVE_DISPUTE]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to resolve dispute." 
    }, { status: 500 });
  }
}