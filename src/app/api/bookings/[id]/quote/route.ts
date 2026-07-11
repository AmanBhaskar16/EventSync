
// POST — vendor sends quote | PATCH — customer responds

import { NextRequest, NextResponse } from "next/server";
import { auth }   from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });

    const { id: bookingId } = await params;

    const booking = await prisma.booking.findUnique({
      where:  { id: bookingId },
      select: { 
        id: true, 
        status: true, 
        vendorId: true, 
        vendor: { 
          select: { 
            userId: true 
          } 
        } 
      },
    });
    if (!booking) return NextResponse.json({ 
      success: false, 
      error: "Booking not found." 
    }, { status: 404 });

    const b      = booking as Record<string, unknown>;
    const vendor = b.vendor as Record<string, unknown>;
    if (session.user.id !== vendor.userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Only the vendor can send quotes." 
      }, { status: 403 });
    }

    const currentStatus = b.status as string;
    if (!["INQUIRY", "NEGOTIATION"].includes(currentStatus)) {
      return NextResponse.json({ 
        success: false, 
        error: `Cannot send quote when booking is ${currentStatus}.` 
      }, { status: 400 });
    }

    const body = await req.json() as {
      lineItems: LineItem[]; gstRate: number; validDays: number; notes?: string; terms?: string;
    };
    const { lineItems, gstRate = 18, validDays = 7, notes, terms } = body;

    if (!lineItems?.length) {
      return NextResponse.json({ 
        success: false, 
        error: "At least one line item is required." 
      }, { status: 400 });
    }

    const subtotal    = lineItems.reduce((s, item) => s + item.total, 0);
    const gstAmount   = (subtotal * gstRate) / 100;
    const totalAmount = subtotal + gstAmount;
    const validUntil  = new Date(Date.now() + validDays * 86400000);

    const latestQuote = await prisma.quote.findFirst({
      where:   { bookingId },
      orderBy: { version: "desc" },
      select:  { version: true },
    });
    const version = ((latestQuote as { version?: number } | null)?.version ?? 0) + 1;
    const quote = await prisma.quote.create({
      data: {
        bookingId,
        vendorId:    b.vendorId as string,
        status:      "SENT",
        lineItems:   lineItems as LineItem[], // Cast to satisfy Prisma Json field — runtime value is correct
        subtotal,
        gstRate,
        gstAmount,
        totalAmount,
        validUntil,
        notes:  notes ?? null,
        terms:  terms ?? null,
        version,
      },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data:  { status: "QUOTE_SENT" },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Quote sent.", 
      data: quote 
    }, { status: 201 });
  } catch (err) {
    console.error("[SEND_QUOTE]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to send quote." 
    }, { status: 500 });
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });

    const { id: bookingId } = await params;
    const body = await req.json() as { action: "ACCEPT" | "REJECT" | "COUNTER"; message?: string };
    const { action, message } = body;

    const booking = await prisma.booking.findUnique({
      where:  { id: bookingId },
      select: {
        id: true, status: true,
        event:  { 
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
            userId: true 
          } 
        },
      },
    });
    if (!booking) return NextResponse.json({ 
      success: false, 
      error: "Booking not found." 
    }, { status: 404 });

    const b = booking as Record<string, unknown>;
    const event = b.event    as Record<string, unknown>;
    const customer = event.customer as Record<string, unknown>;
    const vendorR  = b.vendor   as Record<string, unknown>;

    const isCustomer = session.user.id === customer.userId;
    const isVendor   = session.user.id === vendorR.userId;
    if (!isCustomer && !isVendor) {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied."
      }, { status: 403 });
    }

    const quote = await prisma.quote.findFirst({
      where:   { bookingId, status: "SENT" },
      orderBy: { version: "desc" },
      select:  { 
        id: true, 
        totalAmount: true 
      },
    });

    if (!quote) return NextResponse.json({ 
      success: false, 
      error: "No pending quote found." 
    }, { status: 404 });

    const quoteId  = (quote as { 
      id: string; 
      totalAmount: number 
    }).id;

    const total  = (quote as { 
      id: string; 
      totalAmount: number }).totalAmount;

    // ── ACCEPT ──────────────────────────────────────────────────────────────
    if (action === "ACCEPT" && isCustomer) {
      await prisma.$transaction(async (tx) => {
        // 1. Mark quote accepted
        await tx.quote.update({ 
          where: { id: quoteId }, 
          data: { status: "ACCEPTED" } 
        });

        // 2. Confirm booking + set agreedPrice
        await tx.booking.update({
          where: { id: bookingId },
          data:  { 
            status: "CONFIRMED", 
            confirmedAt: new Date(), 
            agreedPrice: total 
          },
        });

        // 3. Create 3 payment milestone records
        const milestones: Array<{ milestone: "BOOKING_CONFIRMATION" | "PRE_EVENT" | "POST_EVENT"; pct: number }> = [
          { milestone: "BOOKING_CONFIRMATION", pct: 0.30 },
          { milestone: "PRE_EVENT", pct: 0.40 },
          { milestone: "POST_EVENT", pct: 0.30 },
        ];
        for (const m of milestones) {
          await tx.payment.create({
            data: {
              bookingId,
              milestone: m.milestone,
              amount: Math.round(total * m.pct * 100) / 100,
              status: "PENDING",
            },
          });
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: "Quote accepted. Booking confirmed!" 
      });
    }

    // ── REJECT ──────────────────────────────────────────────────────────────
    if (action === "REJECT" && isCustomer) {
      await prisma.quote.update({ 
        where: { id: quoteId }, 
        data: { status: "REJECTED" } 
      });

      await prisma.booking.update({ 
        where: { id: bookingId }, 
        data: { status: "INQUIRY" } 
      });

      return NextResponse.json({ 
        success: true, 
        message: "Quote rejected." 
      });
    }

    // ── COUNTER ─────────────────────────────────────────────────────────────
    if (action === "COUNTER" && isCustomer) {
      await prisma.quote.update({ 
        where: { id: quoteId }, 
        data: { status: "COUNTER_OFFERED" } 
      });

      await prisma.booking.update({ 
        where: { id: bookingId }, 
        data: { status: "NEGOTIATION" } });

      if (message) {
        await prisma.message.create({
          data: { 
            bookingId, 
            senderId: session.user.id, 
            content: message 
          },
        });
      }

      return NextResponse.json({ 
        success: true, 
        message: "Counter-offer sent." 
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: "Invalid action." 
    }, { status: 400 });

  } catch (err) {
    console.error("[RESPOND_QUOTE]", err);

    return NextResponse.json({ 
      success: false, 
      error: "Failed to respond to quote." 
    }, { status: 500 });
  }
};