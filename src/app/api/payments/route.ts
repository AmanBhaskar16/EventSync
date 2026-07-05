
import { NextRequest, NextResponse } from "next/server";
import { auth }   from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });

    const bookingId = req.nextUrl.searchParams.get("bookingId");
    if (!bookingId) return NextResponse.json({ 
      success: false, 
      error: "bookingId required." 
    }, { status: 400 });

    const payments = await prisma.payment.findMany({
      where:   { bookingId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true, 
        milestone: true, 
        amount: true,
        status: true, 
        paidAt: true, 
        createdAt: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: payments 
    });
  } catch (err) {
    console.error("[GET_PAYMENTS]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch payments." 
    }, { status: 500 });
  }
}