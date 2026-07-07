
// GET  — list all staff for vendor
// POST — add new staff member

import { NextRequest, NextResponse } from "next/server";
import { auth }   from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const session = await auth();
    
    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." }, { status: 401 });

    const vendor = await prisma.vendor.findUnique({
      where:  { userId: session.user.id },
      select: { id: true },
    });

    if (!vendor) return NextResponse.json({ 
      success: false, 
      error: "Vendor not found." 
    }, { status: 404 });

    const staff = await prisma.staffMember.findMany({
      where:   { vendorId: (vendor as { id: string }).id },
      orderBy: { name: "asc" },
      select: {
        id: true, 
        name: true, 
        role: true, 
        phone: true,
        email: true, 
        dailyRate: true, 
        isActive: true, 
        createdAt: true,
        assignments: {
          orderBy: { date: "desc" },
          take:    5,
          select:  { 
            id: true, 
            date: true, 
            bookingId: true, 
            notes: true 
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: staff 
    });

  } catch (err) {

    console.error("[GET_STAFF]", err);

    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch staff." 
    }, { status: 500 });
  }
}

export const POST = async (req: NextRequest) => {
  try {
    const session = await auth();

    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });

    if (session.user.role !== "VENDOR") return NextResponse.json({ 
      success: false, 
      error: "Vendors only." 
    }, { status: 403 });

    const vendor = await prisma.vendor.findUnique({
      where:  { userId: session.user.id },
      select: { id: true },
    });

    if (!vendor) return NextResponse.json({ 
      success: false, 
      error: "Vendor not found." 
    }, { status: 404 });

    const body = await req.json() as {
      name: string; 
      role: string; 
      phone?: string;
      email?: string; 
      dailyRate?: number;
    };

    const { name, role, phone, email, dailyRate } = body;

    if (!name?.trim()) return NextResponse.json({ 
      success: false, 
      error: "Name is required." 
    }, { status: 400 });

    const member = await prisma.staffMember.create({
      data: {
        vendorId:  (vendor as { id: string }).id,
        name: name.trim(),
        role: (role ?? "OTHER") as "MANAGER"|"CHEF"|"ASSISTANT"|"DRIVER"|"COORDINATOR"|"PHOTOGRAPHER"|"DECORATOR"|"SECURITY"|"OTHER",
        phone: phone?.trim()  ?? null,
        email: email?.trim()  ?? null,
        dailyRate: dailyRate ?? null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: member, 
      message: "Staff member added." 
    }, { status: 201 });

  } catch (err) {

    console.error("[CREATE_STAFF]", err);

    return NextResponse.json({ 
      success: false, 
      error: "Failed to add staff." 
    }, { status: 500 });
  }
}