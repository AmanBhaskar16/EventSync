
// GET   /api/bookings/[id] — booking detail (customer or vendor)
// PATCH /api/bookings/[id] — update status (with transition guard)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true, 
        status: true, 
        agreedPrice: true, 
        specialRequests: true,
        guestCount: true, 
        confirmedAt: true, 
        completedAt: true,
        cancelledAt: true, 
        cancelReason: true, 
        createdAt: true, 
        updatedAt: true,
        event: {
          select: {
            id: true, 
            title: true, 
            type: true, 
            eventDate: true,
            city: true, 
            guestCount: true,
            customer: { 
              select: { 
                id: true, 
                user: { 
                  select: { 
                    id: true, 
                    name: true, 
                    email: true, 
                    avatar: true 
                  } 
                } 
              } 
            },
          },
        },
        vendor: {
          select: {
            id: true, 
            businessName: true, 
            category: true, 
            city: true, 
            state: true,
            avgRating: true, 
            responseTime: true, 
            isVerified: true,
            user: { 
              select: { 
                id: true, 
                name: true, 
                email: true 
              } 
            },
          },
        },
        payments: {
          select: { 
            id: true,
            milestone: true, 
            amount: true, 
            status: true, 
            paidAt: true },
          orderBy: { 
            createdAt: "asc" 
          },
        },
        review: {
          select: { 
            id: true, 
            overallRating: true, 
            comment: true, 
            createdAt: true 
          },
        },
        dispute: {
          select: { 
            id: true, 
            reason: true, 
            status: true, 
            createdAt: true 
          },
        },
      },
    });

    if (!booking) return NextResponse.json({ success: false, error: "Booking not found." }, { status: 404 });

    // Access control
    const b = booking as Record<string, unknown>;
    const event    = b.event    as Record<string, unknown>;
    const vendor   = b.vendor   as Record<string, unknown>;
    const customer = event.customer as Record<string, unknown>;
    const custUser = (customer.user as Record<string, unknown>);
    const vendUser = (vendor.user   as Record<string, unknown>);

    const isCustomer = session.user.id === custUser.id;
    const isVendor   = session.user.id === vendUser.id;
    const isAdmin    = session.user.role === "ADMIN";

    if (!isCustomer && !isVendor && !isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied." 
      }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true, 
      data: booking 
    });
  } catch (err) {
    console.error("[GET_BOOKING]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch booking." 
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

    const { id }   = await params;
    const body     = await req.json() as { status?: string; cancelReason?: string };
    const { status, cancelReason } = body;

    const booking = await prisma.booking.findUnique({
      where:  { id },
      select: {
        status: true,
        event:  { 
          select: { 
            customer: { 
              select: { 
                user: { 
                  select: { 
                    id: true 
                  } 
                } 
              } 
            } 
          } 
        },
        vendor: { 
          select: { 
            user: { 
              select: { 
                id: true 
              } 
            } 
          } 
        },
      },
    });
    if (!booking) return NextResponse.json({ 
      success: false, 
      error: "Booking not found." 
    }, { status: 404 });

    const b        = booking as Record<string, unknown>;
    const event    = b.event    as Record<string, unknown>;
    const vendor   = b.vendor   as Record<string, unknown>;
    const custUser = ((event.customer as Record<string, unknown>).user as Record<string, unknown>);
    const vendUser = (vendor.user as Record<string, unknown>);

    const isCustomer = session.user.id === custUser.id;
    const isVendor   = session.user.id === vendUser.id;
    const current    = b.status as string;

    // Status transition guard
    const allowed: Record<string, string[]> = {
      INQUIRY:     isVendor   ? ["QUOTE_SENT", "CANCELLED"] : ["CANCELLED"],
      QUOTE_SENT:  isCustomer ? ["NEGOTIATION", "CANCELLED"] : isVendor ? ["CANCELLED"] : [],
      NEGOTIATION: isCustomer ? ["CONFIRMED",   "CANCELLED"] : isVendor ? ["CANCELLED"] : [],
      CONFIRMED:   isVendor   ? ["IN_PROGRESS"] : ["CANCELLED"],
      IN_PROGRESS: isVendor   ? ["COMPLETED"]   : [],
    };

    if (status && !(allowed[current] ?? []).includes(status)) {
      return NextResponse.json(
        { success: false, 
          error: `Cannot transition from ${current} to ${status}.` 
        },{ status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (status)       data.status       = status;
    if (cancelReason) data.cancelReason = cancelReason;
    if (status === "CONFIRMED")  data.confirmedAt  = new Date();
    if (status === "COMPLETED")  data.completedAt  = new Date();
    if (status === "CANCELLED")  data.cancelledAt  = new Date();

    const updated = await prisma.booking.update({ 
      where: { id }, 
      data 
    });

    return NextResponse.json({ 
      success: true, 
      data: updated, 
      message: "Booking updated." 
    });
  } catch (err) {
    console.error("[UPDATE_BOOKING]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update booking." 
    }, { status: 500 });
  }
}