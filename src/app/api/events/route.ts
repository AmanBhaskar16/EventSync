
// GET  — list customer events
// POST — create new event

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

    const customer = await prisma.customer.findUnique({
      where:  { userId: session.user.id },
      select: { id: true },
    });
    if (!customer) return NextResponse.json({ 
      success: true, 
      data: [] 
    }, { status: 200 });

    // Check if caller wants only upcoming events (for booking picker)
    const upcomingOnly = req.nextUrl.searchParams.get("upcoming") === "true";

    const where: Record<string, unknown> = {
      customerId: (customer as { id: string }).id,
    };

    // For booking picker — only show events from today onwards
    if (upcomingOnly) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      where.eventDate = { gte: todayStart };
      where.status    = { notIn: ["CANCELLED", "COMPLETED"] };
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { eventDate: "asc" },
      select: {
        id: true, 
        title: true, 
        type: true, 
        status: true,
        eventDate: true, 
        city: true, 
        guestCount: true, 
        budget: true,
        bookings: { 
          select: { 
            id: true, 
            status: true 
          } 
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: events 
    });
  } catch (err) {
    console.error("[GET_EVENTS]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch events." 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });


    if (session.user.role !== "CUSTOMER") return NextResponse.json({ 
      success: false, 
      error: "Customers only." 
    }, { status: 403 });

    const customer = await prisma.customer.findUnique({
      where:  { userId: session.user.id },
      select: { id: true },
    });

    if (!customer) return NextResponse.json({ 
      success: false, 
      error: "Customer profile not found." 
    }, { status: 404 });

    const body = await req.json() as {
      title: string; 
      type: string; 
      eventDate: string;
      city?: string; 
      state?: string; 
      venue?: string;
      guestCount?: number; 
      budget?: number; 
      description?: string;
    };

    const { title, type, eventDate, city, state, venue, guestCount, budget, description } = body;

    if (!title?.trim())  return NextResponse.json({ 
      success: false, 
      error: "Title is required." 
    },{ status: 400 });

    if (!type)return NextResponse.json({ 
      success: false, 
      error: "Event type is required." 
    }, { status: 400 });
    
    if (!eventDate) return NextResponse.json({ 
      success: false, 
      error: "Event date is required." 
    }, { status: 400 });

    const event = await prisma.event.create({
      data: {
        customerId:  (customer as { id: string }).id,
        title: title.trim(),
        type: type as "WEDDING"|"BIRTHDAY"|"BACHELORETTE"|"BACHELOR"|"ANNIVERSARY"|"CORPORATE"|"KITTY_PARTY"|"REUNION"|"BABY_SHOWER"|"ENGAGEMENT"|"COCKTAIL_PARTY"|"OTHER",
        status: "PLANNING",
        eventDate: new Date(eventDate),
        city: city?.trim() ?? null,
        state: state?.trim() ?? null,
        venue: venue?.trim() ?? null,
        guestCount:  guestCount ?? null,
        budget: budget ?? null,
        description: description?.trim() ?? null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: event, 
      message: "Event created!" 
    }, { status: 201 });

  } catch (err) {
    console.error("[CREATE_EVENT]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create event." 
    }, { status: 500 });
  }
}