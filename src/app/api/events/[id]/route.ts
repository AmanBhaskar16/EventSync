
// GET    — event detail with bookings
// PATCH  — update event
// DELETE — delete event

import { NextRequest, NextResponse } from "next/server";
import { auth }   from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });

    const { id } = await params;

    const event = await prisma.event.findUnique({
      where:  { id },
      select: {
        id: true, 
        title: true, 
        type: true, 
        status: true, 
        eventDate: true,
        city: true, 
        state: true, 
        venue: true, 
        guestCount: true,
        budget: true, 
        description: true, 
        createdAt: true,
        customer: { select: { userId: true } },
        bookings: {
          select: {
            id: true, 
            status: true, 
            agreedPrice: true, 
            createdAt: true,
            vendor: { 
              select: { 
                id: true, 
                businessName: true, 
                category: true, 
                city: true, 
                avgRating: true 
              } 
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!event) return NextResponse.json({ 
      success: false, 
      error: "Event not found." 
    }, { status: 404 });

    const e    = event as Record<string, unknown>;
    const custR = e.customer as Record<string, unknown>;
    if (session.user.id !== custR.userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied." 
      }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true, 
      data: event 
    });

  } catch (err) {
    console.error("[GET_EVENT]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch event." 
    }, { status: 500 });
  }
}

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

    const { id } = await params;

    const body   = await req.json() as Record<string, unknown>;

    const event = await prisma.event.findUnique({
      where:  { id },
      select: { customer: { select: { userId: true } } },
    });

    if (!event) return NextResponse.json({ 
      success: false, 
      error: "Event not found." 
    }, { status: 404 });

    const e    = event as Record<string, unknown>;
    const custR = e.customer as Record<string, unknown>;
    
    if (session.user.id !== custR.userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied." 
      }, { status: 403 });
    }

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = (body.title as string).trim();
    if (body.type !== undefined) data.type = body.type;
    if (body.eventDate !== undefined) data.eventDate = new Date(body.eventDate as string);
    if (body.city !== undefined) data.city = body.city;
    if (body.state !== undefined) data.state = body.state;
    if (body.venue !== undefined) data.venue = body.venue;
    if (body.guestCount !== undefined) data.guestCount = body.guestCount;
    if (body.budget !== undefined) data.budget = body.budget;
    if (body.description !== undefined) data.description = body.description;
    if (body.status !== undefined) data.status = body.status;

    const updated = await prisma.event.update({ where: { id }, data });
    return NextResponse.json({ 
      success: true, 
      data: updated 
    });
  } catch (err) {
    console.error("[UPDATE_EVENT]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update event." 
    }, { status: 500 });
  }
}

export const DELETE = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });

    const { id } = await params;
    const event  = await prisma.event.findUnique({
      where:  { id },
      select: { customer: { select: { userId: true } } },
    });
    if (!event) return NextResponse.json({ 
      success: false, 
      error: "Event not found." 
    }, { status: 404 });

    const e    = event as Record<string, unknown>;
    const custR = e.customer as Record<string, unknown>;
    if (session.user.id !== custR.userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied." 
      }, { status: 403 });
    }

    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ 
      success: true, 
      message: "Event deleted." 
    });
  } catch (err) {
    console.error("[DELETE_EVENT]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to delete event." 
    }, { status: 500 });
  }
}