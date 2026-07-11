
// POST — called from frontend after Stripe payment succeeds
// This is the reliable way in local dev without webhook

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth }   from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-06-24.dahlia" });

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });

    const body = await req.json() as { 
      paymentIntentId: string; 
      bookingId: string; 
      milestone: string 
    };

    const { paymentIntentId, bookingId, milestone } = body;

    if (!paymentIntentId || !bookingId || !milestone) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing fields." 
      }, { status: 400 });
    }

    // Verify with Stripe that payment actually succeeded
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status !== "succeeded") {
      return NextResponse.json({ 
        success: false, 
        error: `Payment not succeeded. Status: ${intent.status}` 
      }, { status: 400 });
    }

    // Mark payment as PAID
    await prisma.payment.updateMany({
      where: {
        bookingId,
        milestone: milestone as "BOOKING_CONFIRMATION" | "PRE_EVENT" | "POST_EVENT",
      },
      data: {
        status:            "PAID",
        razorpayPaymentId: paymentIntentId,
        paidAt:            new Date(),
      },
    });

    // Check if all 3 paid → mark booking COMPLETED
    const payments = await prisma.payment.findMany({
      where:  { bookingId },
      select: { status: true },
    });

    const allPaid = payments.length === 3 && payments.every((p) => (p as { status: string }).status === "PAID");

    if (allPaid) {
      await prisma.booking.update({
        where: { id: bookingId },
        data:  { 
          status: "COMPLETED", 
          completedAt: new Date() 
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Payment confirmed." 
    });

  } catch (err) {
    console.error("[CONFIRM_PAYMENT]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to confirm payment." 
    }, { status: 500 });
  }
}