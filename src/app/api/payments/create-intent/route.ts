
// POST — create Stripe PaymentIntent for a booking milestone

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
      bookingId: string; 
      milestone: string 
    };

    const { bookingId, milestone } = body;

    if (!bookingId || !milestone) {
      return NextResponse.json({ 
        success: false, 
        error: "bookingId and milestone required." 
      }, { status: 400 });
    }

    // Get booking + agreed price
    const booking = await prisma.booking.findUnique({
      where:  { id: bookingId },
      select: {
        id: true, 
        agreedPrice: true, 
        status: true,
        event: { 
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
            businessName: true 
          } 
        },
      },
    });
    if (!booking) return NextResponse.json({ 
      success: false, 
      error: "Booking not found." 
    }, { status: 404 });

    const b = booking as Record<string, unknown>;
    const event  = b.event  as Record<string, unknown>;
    const custR  = event.customer as Record<string, unknown>;
    if (session.user.id !== custR.userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Only the customer can make payments." 
      }, { status: 403 });
    }

    if (!(b.status as string === "CONFIRMED")) {
      return NextResponse.json({ 
        success: false, 
        error: "Booking must be confirmed before payment." 
      }, { status: 400 });
    }

    const agreedPrice = b.agreedPrice as number;
    if (!agreedPrice) return NextResponse.json({ success: false, error: "No agreed price on booking." }, { status: 400 });

    // Calculate milestone amount
    const MILESTONE_PCT: Record<string, number> = {
      BOOKING_CONFIRMATION: 0.30,
      PRE_EVENT:            0.40,
      POST_EVENT:           0.30,
    };
    const pct    = MILESTONE_PCT[milestone] ?? 0.30;
    const amount = Math.round(agreedPrice * pct * 100); // paise (Stripe uses smallest unit)

    // Check if payment already exists for this milestone
    const existing = await prisma.payment.findFirst({
      where: { bookingId, milestone: milestone as "BOOKING_CONFIRMATION"|"PRE_EVENT"|"POST_EVENT" },
      select: { id: true, status: true },
    });
    const ex = existing as { id: string; status: string } | null;
    if (ex?.status === "PAID") {
      return NextResponse.json({ 
        success: false, 
        error: "This milestone is already paid." 
      }, { status: 409 });
    }

    const vendorR = b.vendor as Record<string, unknown>;

    // Create Stripe PaymentIntent
    const intent = await stripe.paymentIntents.create({
      amount,
      currency:    "inr",
      description: `EventSync — ${vendorR.businessName} — ${milestone.replace(/_/g, " ")}`,
      metadata: {
        bookingId,
        milestone,
        userId: session.user.id,
      },
    });

    // Upsert Payment record
    if (ex) {
      await prisma.payment.update({
        where: { id: ex.id },
        data:  { status: "PROCESSING", razorpayOrderId: intent.id },
      });
    } else {
      await prisma.payment.create({
        data: {
          bookingId,
          milestone: milestone as "BOOKING_CONFIRMATION"|"PRE_EVENT"|"POST_EVENT",
          amount:    amount / 100,
          status:    "PROCESSING",
          razorpayOrderId: intent.id, // reusing field for Stripe intent id
        },
      });
    }

    return NextResponse.json({
      success:      true,
      clientSecret: intent.client_secret,
      amount:       amount / 100,
      currency:     "inr",
    });
  } catch (err) {
    console.error("[CREATE_INTENT]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create payment intent." 
    }, { status: 500 });
  }
}