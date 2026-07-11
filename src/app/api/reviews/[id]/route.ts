
// PATCH — vendor replies to a review

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });

    const { id }  = await params;
    const body = await req.json() as { vendorReply: string };
    const { vendorReply } = body;

    if (!vendorReply?.trim()) return NextResponse.json({ 
      success: false, 
      error: "Reply cannot be empty." 
    }, { status: 400 });

    const review = await prisma.review.findUnique({
      where:  { id },
      select: { vendorId: true },
    });

    if (!review) return NextResponse.json({ 
      success: false, 
      error: "Review not found." 
    }, { status: 404 });

    const r = review as Record<string, unknown>;

    const vendor = await prisma.vendor.findUnique({ 
      where: { userId: session.user.id }, 
      select: { id: true } 
    });

    const v = vendor as { id: string } | null;

    if (v?.id !== r.vendorId) return NextResponse.json({ 
      success: false, 
      error: "Access denied." 
    }, { status: 403 });

    const updated = await prisma.review.update({
      where: { id },
      data:  { vendorReply: vendorReply.trim() },
    });

    return NextResponse.json({ 
      success: true, 
      data: updated, 
      message: "Reply posted." 
    });

  } catch (err) {
    console.error("[VENDOR_REPLY]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to post reply." 
    }, { status: 500 });
  }
}