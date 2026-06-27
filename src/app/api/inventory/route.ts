import { NextRequest, NextResponse } from "next/server";
import { auth }   from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
 
export const dynamic = "force-dynamic";
 
export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });
 
    const vendor = await prisma.vendor.findUnique({
      where:  { userId: session.user.id },
      select: { id: true },
    });
    if (!vendor) return NextResponse.json({ 
      success: false, 
      error: "Vendor not found." 
    }, { status: 404 });
 
    const items = await prisma.inventoryItem.findMany({
      where:   { vendorId: (vendor as { id: string }).id },
      orderBy: { name: "asc" },
      select: {
        id: true, 
        name: true, 
        description: true, 
        totalQuantity: true,
        unit: true, 
        isReusable: true, 
        lowStockAlert: true, 
        maintenanceQty: true,
        createdAt: true, 
        updatedAt: true,
      },
    });
    return NextResponse.json({ 
      success: true, 
      data: items 
    });
  } catch (err) {
    console.error("[GET_INVENTORY]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch inventory." 
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
      description?: string; 
      totalQuantity: number;
      unit: string; 
      isReusable?: boolean; 
      lowStockAlert?: number;
    };
 
    const { name, description, totalQuantity, unit, isReusable = true, lowStockAlert = 5 } = body;
 
    if (!name?.trim()) return NextResponse.json({ 
      success: false,
      error: "Name is required." 
    }, { status: 400 });

    if (!totalQuantity || totalQuantity < 1) return NextResponse.json({ 
      success: false, 
      error: "Quantity must be at least 1." 
    }, { status: 400 });

    if (!unit?.trim()) return NextResponse.json({ 
      success: false, 
      error: "Unit is required." 
    }, { status: 400 });
 
    const item = await prisma.inventoryItem.create({
      data: {
        vendorId: (vendor as { id: string }).id,
        name:          name.trim(),
        description:   description?.trim() ?? null,
        totalQuantity,
        unit:          unit.trim(),
        isReusable,
        lowStockAlert,
        maintenanceQty: 0,
      },
    });
 
    return NextResponse.json({ 
      success: true, 
      data: item, 
      message: "Item created." 
    }, { status: 201 });
  } catch (err) {
    console.error("[CREATE_INVENTORY]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create item." 
    }, { status: 500 });
  }
}