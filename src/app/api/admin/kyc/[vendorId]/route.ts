
// PATCH — approve or reject vendor KYC

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) => {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ 
        success: false, 
        error: "Admin only." 
      }, { status: 403 });
    }

    const { vendorId } = await params;
    const body = await req.json() as { 
      action: "APPROVE" | "REJECT"; 
      note?: string 
    };

    const { action, note } = body;

    if (!["APPROVE","REJECT"].includes(action)) {
      return NextResponse.json({ 
        success: false, 
        error: "action must be APPROVE or REJECT." 
      }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({
      where:  { id: vendorId },
      select: { id: true, 
        kycStatus: true 
      },
    });
    if (!vendor) return NextResponse.json({ 
      success: false, 
      error: "Vendor not found." 
    }, { status: 404 });

    const updated = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        kycStatus: action === "APPROVE" ? "APPROVED" : "REJECTED",
        isVerified: action === "APPROVE",
        kycRejectionNote: action === "REJECT" ? (note?.trim() ?? "KYC rejected by admin.") : null,
      },
    });

    return NextResponse.json({
      success: true,
      data:    updated,
      message: action === "APPROVE" ? "Vendor KYC approved." : "Vendor KYC rejected.",
    });
  } catch (err) {
    console.error("[KYC_REVIEW]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update KYC." 
    }, { status: 500 });
  }
}