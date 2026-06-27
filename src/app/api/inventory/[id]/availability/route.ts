import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
 
export const dynamic = "force-dynamic";
 
export async function GET(
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
    const dateParam = req.nextUrl.searchParams.get("date");
    if (!dateParam) return NextResponse.json({ 
      success: false, 
      error: "date query param required." 
    }, { status: 400 });
 
    const date      = new Date(dateParam);
    const dayStart  = new Date(date); dayStart.setHours(0,0,0,0);
    const dayEnd    = new Date(date); dayEnd.setHours(23,59,59,999);
 
    const item = await prisma.inventoryItem.findUnique({
      where:  { id },
      select: {
        id: true, 
        name: true, 
        totalQuantity: true,
        maintenanceQty: true, 
        unit: true, 
        lowStockAlert: true,
      },
    });
    if (!item) return NextResponse.json({ 
      success: false, 
      error: "Item not found." 
    }, { status: 404 });
 
    // Sum all active reservations on this date
    const reservations = await prisma.inventoryReservation.findMany({
      where: {
        itemId:     id,
        releasedAt: null,
        date: { gte: dayStart, lte: dayEnd },
      },
      select: { quantity: true, bookingId: true },
    });
 
    const i = item as { 
      id:string; 
      name:string; 
      totalQuantity:number; 
      maintenanceQty:number; 
      unit:string; 
      lowStockAlert:number 
    };
    const r = reservations as Array<{ 
      quantity:number; 
      bookingId:string 
    }>;
 
    const reservedQty  = r.reduce((s, res) => s + res.quantity, 0);
    const availableQty = i.totalQuantity - i.maintenanceQty - reservedQty;
 
    return NextResponse.json({
      success: true,
      data: {
        itemId: i.id,
        name: i.name,
        date: dateParam,
        totalQuantity: i.totalQuantity,
        maintenanceQty: i.maintenanceQty,
        reservedQty,
        availableQty: Math.max(0, availableQty),
        unit: i.unit,
        isLowStock: availableQty <= i.lowStockAlert,
        reservations: r,
      },
    });
  } catch (err) {
    console.error("[CHECK_AVAILABILITY]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to check availability." 
    }, { status: 500 });
  }
}
 