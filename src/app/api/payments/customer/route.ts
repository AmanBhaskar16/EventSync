
// GET — all payments for current customer across all bookings

import { NextResponse }  from "next/server";
import { auth }   from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ 
            success: false, 
            error: "Unauthorized." 
        }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where:  { userId: session.user.id },
      select: { id: true },
    });
    if (!customer) return NextResponse.json({ success: true, data: [] });

    const payments = await prisma.payment.findMany({
      where: {
        booking: {
          event: { customerId: (customer as { id: string }).id },
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, 
        milestone: true, 
        amount: true,
        status: true, 
        paidAt: true,
        booking: {
          select: {
            id: true, 
            agreedPrice: true,
            event:  { 
                select: { 
                    title: true, 
                    eventDate: true 
                } 
            },
            vendor: { select: { businessName: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (err) {
    console.error("[CUSTOMER_PAYMENTS]", err);
    return NextResponse.json({ success: false, error: "Failed." }, { status: 500 });
  }
}