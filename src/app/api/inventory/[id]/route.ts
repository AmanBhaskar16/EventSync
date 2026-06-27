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
 
    const { id } = await params;
    const item = await prisma.inventoryItem.findUnique({
      where:  { id },
      select: {
        id: true, 
        vendorId: true, 
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
 
    if (!item) return NextResponse.json({ 
      success: false, 
      error: "Item not found." 
    }, { status: 404 });
 
    // Verify ownership
    const vendor = await prisma.vendor.findUnique({ 
      where: { userId: session.user.id }, 
      select: { id: true } 
    });

    const v = vendor as { id: string } | null;
    const i = item  as Record<string, unknown>;
    if (session.user.role !== "ADMIN" && v?.id !== i.vendorId) {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied." 
      }, { status: 403 });
    }
 
    return NextResponse.json({ 
      success: true, 
      data: item 
    });
  } catch (err) {
    console.error("[GET_INVENTORY_ITEM]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch item." 
    }, { status: 500 });
  }
}
 
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });
 
    const { id } = await params;
    const body = await req.json() as {
      name?: string; 
      description?: string; 
      totalQuantity?: number;
      unit?: string; 
      isReusable?: boolean; 
      lowStockAlert?: number; 
      maintenanceQty?: number;
    };
 
    const item = await prisma.inventoryItem.findUnique({ 
      where: { id }, 
      select: { vendorId: true } 
    });

    if (!item) return NextResponse.json({ 
      success: false, 
      error: "Item not found." 
    }, { status: 404 });
 
    const vendor = await prisma.vendor.findUnique({ 
      where: { userId: session.user.id }, 
      select: { id: true } 
    });

    const v = vendor as { id: string } | null;

    const i = item  as Record<string, unknown>;

    if (v?.id !== i.vendorId) return NextResponse.json({ 
      success: false, 
      error: "Access denied." 
    }, { status: 403 });
 
    const data: Record<string, unknown> = {};
    if (body.name          !== undefined) data.name          = body.name.trim();
    if (body.description   !== undefined) data.description   = body.description.trim() || null;
    if (body.totalQuantity !== undefined) data.totalQuantity = body.totalQuantity;
    if (body.unit          !== undefined) data.unit          = body.unit.trim();
    if (body.isReusable    !== undefined) data.isReusable    = body.isReusable;
    if (body.lowStockAlert !== undefined) data.lowStockAlert = body.lowStockAlert;
    if (body.maintenanceQty !== undefined) data.maintenanceQty = body.maintenanceQty;
 
    const updated = await prisma.inventoryItem.update({ 
      where: { id }, 
      data 
    });

    return NextResponse.json({ 
      success: true, 
      data: updated, 
      message: "Item updated." 
    });
  } catch (err) {
    console.error("[UPDATE_INVENTORY_ITEM]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update item." 
    }, { status: 500 });
  }
}
 
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });
 
    const { id } = await params;
    const item = await prisma.inventoryItem.findUnique({ 
      where: { id }, 
      select: { vendorId: true } 
    });

    if (!item) return NextResponse.json({ 
      success: false, 
      error: "Item not found." 
    }, { status: 404 });
 
    const vendor = await prisma.vendor.findUnique({ 
      where: { userId: session.user.id }, 
      select: { id: true } 
    });

    const v = vendor as { id: string } | null;

    const i = item  as Record<string, unknown>;

    if (v?.id !== i.vendorId) return NextResponse.json({ 
      success: false, 
      error: "Access denied." 
    }, { status: 403 });
 
    await prisma.inventoryItem.delete({ where: { id } });

    return NextResponse.json({ 
      success: true, 
      message: "Item deleted." 
    });

  } catch (err) {
    console.error("[DELETE_INVENTORY_ITEM]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to delete item." 
    }, { status: 500 });
  }
}
 