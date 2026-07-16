
// PATCH  — update service
// DELETE — delete service

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "VENDOR") {
      return NextResponse.json({ 
        success: false, 
        error: "Vendors only." 
      }, { status: 403 });
    }

    const { id } = await params;
    const body   = await req.json() as {
      name?: string; 
      description?: string;
      basePrice?: number; 
      unit?: string; 
      isActive?: boolean;
    };

    const service = await prisma.vendorService.findUnique({
      where:  { id },
      select: { vendorId: true },
    });
    if (!service) return NextResponse.json({ 
      success: false, 
      error: "Service not found." 
    }, { status: 404 });

    const vendor = await prisma.vendor.findUnique({
      where:  { userId: session.user.id },
      select: { id: true },
    });
    const v = vendor as { id: string } | null;
    const s = service as { vendorId: string };
    if (v?.id !== s.vendorId) return NextResponse.json({ 
      success: false, 
      error: "Access denied." 
    }, { status: 403 });

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name.trim();
    if (body.description !== undefined) data.description = body.description?.trim() || null;
    if (body.basePrice !== undefined) data.basePrice = body.basePrice;
    if (body.unit !== undefined) data.unit = body.unit.trim();
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const updated = await prisma.vendorService.update({
      where:  { id },
      data,
      select: {
        id: true, 
        name: true, 
        description: true,
        basePrice: true, 
        unit: true, 
        isActive: true,
        serviceAddons: { 
          select: { 
            id: true, 
            name: true, 
            price: true 
          } 
        },
      },
    });

    const u = updated as Record<string, unknown>;
    const mapped = { ...u, addons: u.serviceAddons, serviceAddons: undefined };

    return NextResponse.json({ 
      success: true, 
      data: mapped, 
      message: "Service updated." 
    });
  } catch (err) {
    console.error("[UPDATE_SERVICE]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update service." 
    }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "VENDOR") {
      return NextResponse.json({ 
        success: false, 
        error: "Vendors only." 
      }, { status: 403 });
    }

    const { id } = await params;
    const service = await prisma.vendorService.findUnique({
      where:  { id },
      select: { vendorId: true },
    });
    if (!service) return NextResponse.json({ 
      success: false, 
      error: "Service not found." 
    }, { status: 404 });

    const vendor = await prisma.vendor.findUnique({
      where:  { userId: session.user.id },
      select: { id: true },
    });
    const v = vendor as { id: string } | null;
    const s = service as { vendorId: string };
    if (v?.id !== s.vendorId) return NextResponse.json({ 
      success: false, 
      error: "Access denied." 
    }, { status: 403 });

    await prisma.vendorService.delete({ where: { id } });
    return NextResponse.json({ 
      success: true, 
      message: "Service deleted." 
    });
  } catch (err) {
    console.error("[DELETE_SERVICE]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to delete service." 
    }, { status: 500 });
  }
}