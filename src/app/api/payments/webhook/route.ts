
// Stripe webhook — marks payment as PAID when charge succeeds

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-06-24.dahlia" });

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[WEBHOOK] Invalid signature:", err);
    return NextResponse.json({ 
      error: "Invalid signature." 
    }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const { bookingId, milestone } = intent.metadata;

    if (bookingId && milestone) {
      // Mark payment as paid
      await prisma.payment.updateMany({
        where: { bookingId, milestone: milestone as "BOOKING_CONFIRMATION"|"PRE_EVENT"|"POST_EVENT" },
        data:  {
          status: "PAID",
          razorpayPaymentId: intent.id,
          paidAt: new Date(),
        },
      });

      // If first milestone paid, keep booking CONFIRMED
      // If all 3 paid, mark COMPLETED
      const payments = await prisma.payment.findMany({
        where:  { bookingId },
        select: { status: true },
      });
      const p = payments as Array<{ status: string }>;
      const allPaid = p.length === 3 && p.every((pay) => pay.status === "PAID");
      if (allPaid) {
        await prisma.booking.update({
          where: { id: bookingId },
          data:  { 
            status: "COMPLETED", 
            completedAt: new Date() 
          },
        });
      }
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const { bookingId, milestone } = intent.metadata;
    if (bookingId && milestone) {
      await prisma.payment.updateMany({
        where: { 
          bookingId, 
          milestone: milestone as "BOOKING_CONFIRMATION"|"PRE_EVENT"|"POST_EVENT" 
        },
        data:  { status: "FAILED" },
      });
    }
  }

  return NextResponse.json({ received: true });
}

// export const config = { api: { bodyParser: false } };