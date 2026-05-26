
// GET  — fetch message thread
// POST — send a message

import { NextRequest, NextResponse } from "next/server";
import { auth }   from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });

    const { id: bookingId } = await params;

    // Verify access
    const booking = await prisma.booking.findUnique({
      where:  { id: bookingId },
      select: {
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

    const b      = booking as Record<string, unknown>;
    const event  = b.event  as Record<string, unknown>;
    const custR  = event.customer as Record<string, unknown>;
    const vendR  = b.vendor as Record<string, unknown>;

    const hasAccess =
      session.user.id === custR.userId ||
      session.user.id === vendR.userId ||
      session.user.role === "ADMIN";

    if (!hasAccess) return NextResponse.json({ 
      success: false, 
      error: "Access denied." 
    }, { status: 403 });

    const messages = await prisma.message.findMany({
      where:   { bookingId },
      orderBy: { createdAt: "asc" },
      select:  { 
        id: true, 
        senderId: true, 
        content: true, 
        isRead: true, 
        createdAt: true 
      },
    });

    // Mark unread messages as read for the current user
    await prisma.message.updateMany({
      where: { 
        bookingId, 
        senderId: { 
          not: session.user.id 
        }, 
        isRead: false 
      },
      data:  { 
        isRead: true 
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: messages 
    });
  } catch (err) {
    console.error("[GET_MESSAGES]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch messages." 
    }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });

    const { id: bookingId } = await params;
    const body = await req.json() as { content: string };
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: "Message content is required." 
      }, { status: 400 });
    }

    // Verify access
    const booking = await prisma.booking.findUnique({
      where:  { id: bookingId },
      select: {
        status: true,
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

    const b     = booking as Record<string, unknown>;
    const event = b.event  as Record<string, unknown>;
    const custR = event.customer as Record<string, unknown>;
    const vendR = b.vendor as Record<string, unknown>;

    const hasAccess =
      session.user.id === custR.userId ||
      session.user.id === vendR.userId;

    if (!hasAccess) return NextResponse.json({ 
      success: false, 
      error: "Access denied." 
    }, { status: 403 });

    const status = b.status as string;
    if (["COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ 
        success: false, 
        error: "Cannot message on a closed booking." 
      }, { status: 400 });
    }

    const message = await prisma.message.create({
      data:   { 
        bookingId, 
        senderId: session.user.id, 
        content: content.trim() 
      },
      select: { 
        id: true, 
        senderId: true, 
        content: true, 
        isRead: true, 
        createdAt: true
       },
    });

    return NextResponse.json({ 
      success: true, 
      data: message 
    }, { status: 201 });
  } catch (err) {
    console.error("[SEND_MESSAGE]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to send message." 
    }, { status: 500 });
  }
}