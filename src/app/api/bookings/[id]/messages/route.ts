// GET  — fetch message thread
// POST — send message + emit socket + notify ONLY if recipient not in room

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { createNotification } from "@/lib/notifications/notifications";

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

    const booking = await prisma.booking.findUnique({
      where:  { id: bookingId },
      select: {
        event:  { 
          select: { 
            customer: { 
              select: { userId: true } 
            } 
          } 
        },
        vendor: { 
          select: { userId: true } 
        },
      },
    });
    if (!booking) return NextResponse.json({ 
      success: false, 
      error: "Booking not found." 
    }, { status: 404 });

    const b  = booking as Record<string, unknown>;
    const event = b.event  as Record<string, unknown>;
    const custR = event.customer as Record<string, unknown>;
    const vendR = b.vendor as Record<string, unknown>;

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

    await prisma.message.updateMany({
      where: { 
        bookingId, 
        senderId: { not: session.user.id }, 
        isRead: false 
      },
      data:  { isRead: true },
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

    const booking = await prisma.booking.findUnique({
      where:  { id: bookingId },
      select: {
        status: true,
        event: {
          select: {
            title: true,
            customer: { 
              select: { 
                userId: true, 
                user: { 
                  select: { name: true } 
                } 
              } 
            },
          },
        },
        vendor: {
          select: {
            userId: true, 
            businessName: true,
            user: { select: { name: true } },
          },
        },
      },
    });
    if (!booking) return NextResponse.json({ 
      success: false, 
      error: "Booking not found." 
    }, { status: 404 });

    const b        = booking as Record<string, unknown>;
    const event    = b.event    as Record<string, unknown>;
    const custR    = event.customer as Record<string, unknown>;
    const vendR    = b.vendor   as Record<string, unknown>;
    const custUser = custR.user as Record<string, unknown>;
    const vendUser = vendR.user as Record<string, unknown>;

    const isCustomer = session.user.id === custR.userId;
    const isVendor   = session.user.id === vendR.userId;

    if (!isCustomer && !isVendor) {
      return NextResponse.json({ success: false, error: "Access denied." }, { status: 403 });
    }

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

    const msg = message as {
      id: string; 
      senderId: string; 
      content: string; 
      isRead: boolean; 
      createdAt: Date;
    };
    const msgPayload = { ...msg, createdAt: msg.createdAt.toISOString() };

    // Emit real-time to booking room
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const io = (global as any).io;
    if (io) {
      io.to(`booking:${bookingId}`).emit("new-message", msgPayload);
    }

    // Check if recipient is CURRENTLY in the booking room
    // If they are — they can see the message in real-time, NO notification needed
    const recipientId  = !isCustomer ? custR.userId as string : vendR.userId as string;
    const senderName   = isCustomer
      ? (custUser.name as string ?? "Customer")
      : (vendUser.name as string ?? vendR.businessName as string);


    const recipientLink = isCustomer
      ? `/vendor/bookings/${bookingId}`
      : `/customer/bookings/${bookingId}`;

    if (io) {
      // Get all sockets in this booking room
      const room  = io.sockets.adapter.rooms.get(`booking:${bookingId}`);
      const roomSockets  = room ? Array.from(room) : [];

      // Get recipient socket id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const onlineUsers: Map<string, string> = (global as any).onlineUsers ?? new Map();
      const recipientSocketId = onlineUsers.get(recipientId);

      // Only notify if recipient is NOT in the booking room
      const recipientInRoom = recipientSocketId
        ? roomSockets.includes(recipientSocketId)
        : false;

      if (!recipientInRoom) {
        await createNotification({
          userId:  recipientId,
          type:    "NEW_MESSAGE",
          title:   `New message from ${senderName}`,
          message: content.trim().slice(0, 80) + (content.length > 80 ? "…" : ""),
          link:    recipientLink,
        });
      }
    } else {
      // No socket server — always create notification
      await createNotification({
        userId:  recipientId,
        type:    "NEW_MESSAGE",
        title:   `New message from ${senderName}`,
        message: content.trim().slice(0, 80) + (content.length > 80 ? "…" : ""),
        link:    recipientLink,
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: msgPayload 
    }, { status: 201 });
  } catch (err) {
    console.error("[SEND_MESSAGE]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to send message." 
    }, { status: 500 });
  }
}