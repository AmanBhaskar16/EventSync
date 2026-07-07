
// PATCH  — update staff member
// DELETE — remove staff member

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

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

    const body   = await req.json() as {
      name?: string; 
      role?: string; 
      phone?: string;
      email?: string; 
      dailyRate?: number; 
      isActive?: boolean;
    };

    const member = await prisma.staffMember.findUnique({ 
      where: { id }, 
      select: { vendorId: true } 
    });

    if (!member) return NextResponse.json({ 
      success: false, 
      error: "Staff member not found." 
    }, { status: 404 });

    const vendor = await prisma.vendor.findUnique({ 
      where: { userId: session.user.id }, 
      select: { id: true } 
    });

    const v = vendor as { id: string } | null;
    const m = member as Record<string, unknown>;

    if (v?.id !== m.vendorId) return NextResponse.json({ 
      success: false, 
      error: "Access denied." 
    }, { status: 403 });

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name.trim();
    if (body.role !== undefined) data.role = body.role;
    if (body.phone !== undefined) data.phone = body.phone?.trim() || null;
    if (body.email !== undefined) data.email = body.email?.trim() || null;
    if (body.dailyRate !== undefined) data.dailyRate = body.dailyRate;
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const updated = await prisma.staffMember.update({ where: { id }, data });

    return NextResponse.json({ 
      success: true, 
      data: updated, 
      message: "Staff updated." 
    });

  } catch (err) {

    console.error("[UPDATE_STAFF]", err);

    return NextResponse.json({ 
      success: false, 
      error: "Failed to update staff." 
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
    const member = await prisma.staffMember.findUnique({ 
      where: { id }, 
      select: { vendorId: true } 
    });
    if (!member) return NextResponse.json({ 
      success: false, 
      error: "Not found." 
    }, { status: 404 });

    const vendor = await prisma.vendor.findUnique({ 
      where: { userId: session.user.id }, 
      select: { id: true } 
    });

    const v = vendor as { id: string } | null;
    const m = member as Record<string, unknown>;

    if (v?.id !== m.vendorId) return NextResponse.json({ 
      success: false, 
      error: "Access denied." 
    }, { status: 403 });

    await prisma.staffMember.delete({ where: { id } });

    return NextResponse.json({ 
      success: true, 
      message: "Staff member removed." 
    });

  } catch (err) {

    console.error("[DELETE_STAFF]", err);

    return NextResponse.json({ 
      success: false, 
      error: "Failed to delete staff." 
    }, { status: 500 });
  }
}