
// POST /api/bookings — create inquiry booking (customer only)
// GET  /api/bookings — list bookings for current user

import { NextRequest, NextResponse } from "next/server";
import { auth }   from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ 
        success: false, 
        error: "Unauthenticated." 
      }, { status: 401 });

    if (session.user.role !== "CUSTOMER")
      return NextResponse.json({ 
        success: false, 
        error: "Only customers can create bookings." 
      }, { status: 403 });

    const body = await req.json() as {
      vendorId: string;
      eventId: string; 
      eventDate: string;
      guestCount?: number;
      specialRequests?: string;
    };

    const { vendorId, eventId, guestCount, specialRequests } = body;

    if (!vendorId) return NextResponse.json({ 
      success: false, 
      error: "vendorId is required." 
    }, { status: 400 });

    if (!eventId)  return NextResponse.json({ 
      success: false, 
      error: "eventId is required. Please select an event." 
    }, { status: 400 });

    // Verify vendor is approved
    const vendor = await prisma.vendor.findUnique({
      where:  { 
        id: vendorId, 
        kycStatus: "APPROVED", 
        isActive: true 
      },
      select: { id: true },
    });

    if (!vendor) return NextResponse.json({ 
      success: false, 
      error: "Vendor not available." 
    }, { status: 404 });

    // Verify event belongs to this customer
    const customer = await prisma.customer.findUnique({
      where:  { userId: session.user.id },
      select: { id: true },
    });

    if (!customer) return NextResponse.json({ 
      success: false, 
      error: "Customer profile not found." 
    }, { status: 404 });

    const event = await prisma.event.findUnique({
      where:  { id: eventId },
      select: { 
        id: true, 
        customerId: true 
      },
    });

    if (!event) return NextResponse.json({ 
      success: false, 
      error: "Event not found." 
    }, { status: 404 });

    const ev = event as { id: string; customerId: string };
    const cu = customer as { id: string };

    if (ev.customerId !== cu.id) {
      return NextResponse.json({ 
        success: false, 
        error: "This event does not belong to you." 
      }, { status: 403 });
    }

    // Check duplicate inquiry
    const duplicate = await prisma.booking.findFirst({
      where: {
        eventId,
        vendorId,
        status: { in: ["INQUIRY", "QUOTE_SENT", "NEGOTIATION", "CONFIRMED", "IN_PROGRESS"] },
      },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, 
          error: "You already have an active booking with this vendor for this event." },
        { status: 409 }
      );
    }

    // Update guest count on event if provided
    if (guestCount) {
      await prisma.event.update({
        where: { id: eventId },
        data:  { guestCount },
      });
    }

    const booking = await prisma.booking.create({
      data: {
        eventId,
        vendorId,
        status: "INQUIRY",
        guestCount: guestCount ?? null,
        specialRequests: specialRequests ?? null,
      },
      select: { id: true },
    });

    return NextResponse.json(
      { success: true, 
        message: "Inquiry sent.", 
        data: { bookingId: (booking as { id: string }).id } 
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[CREATE_BOOKING]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create booking." 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = 10;
    const status = searchParams.get("status") ?? "";

    const where: Record<string, unknown> = {};

    if (status) where.status = status;

    if (session.user.role === "CUSTOMER") {
      const customer = await prisma.customer.findUnique({
        where:  { userId: session.user.id },
        select: { id: true },
      });

      if (!customer) return NextResponse.json({ 
        success: true, 
        data: { bookings: [], pagination: {} } 
      });

      where.event = { 
        customerId: (customer as { id: string }).id 
      };

    } else if (session.user.role === "VENDOR") {

      const vendor = await prisma.vendor.findUnique({
        where:  { userId: session.user.id },
        select: { id: true },
      });

      if (!vendor) return NextResponse.json({ 
        success: true, data: { bookings: [], pagination: {} } 
      });

      where.vendorId = (vendor as { id: string }).id;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        select: {
          id: true, 
          status: true, 
          agreedPrice: true, 
          createdAt: true,
          event:  { 
            select: { 
              id: true, 
              title: true, 
              eventDate: true, 
              city: true, 
              type: true 
            } 
          },
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
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        pagination: {
          total, page, pageSize,
          totalPages:  Math.ceil(total / pageSize),
          hasNextPage: page * pageSize < total,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (err) {
    console.error("[GET_BOOKINGS]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch bookings." 
    }, { status: 500 });
  }
}