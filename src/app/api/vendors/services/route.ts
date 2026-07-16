
// GET  — list vendor services
// POST — create new service

import { NextRequest, NextResponse } from "next/server";
import { auth }   from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "VENDOR") {
      return NextResponse.json({ 
        success: false, 
        error: "Vendors only." 
      }, { status: 403 });
    }

    const vendor = await prisma.vendor.findUnique({
      where:  { 
        userId: session.user.id 
      },
      select: { id: true },
    });
    if (!vendor) return NextResponse.json({ 
      success: false, 
      error: "Vendor not found." 
    }, { status: 404 });

    const services = await prisma.vendorService.findMany({
      where:   { vendorId: (vendor as { id: string }).id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true, 
        name: true, 
        description: true,
        basePrice: true, 
        unit: true, 
        isActive: true, 
        createdAt: true,
        serviceAddons: {
          select:  { 
            id: true, 
            name: true, 
            price: true 
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const mapped = (services as Array<Record<string,unknown>>).map((s) => ({
      ...s,
      addons: s.serviceAddons,
      serviceAddons: undefined,
    }));

    return NextResponse.json({ 
      success: true, 
      data: mapped 
    });
  } catch (err) {
    console.error("[GET_SERVICES]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch services." 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "VENDOR") {
      return NextResponse.json({ 
        success: false, 
        error: "Vendors only." 
      }, { status: 403 });
    }

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
      basePrice: number; 
      unit: string;
    };
    const { name, description, basePrice, unit } = body;

    if (!name?.trim()) return NextResponse.json({ 
      success: false, 
      error: "Name is required." 
    }, { status: 400 });

    if (!basePrice || basePrice <= 0) return NextResponse.json({ 
      success: false, 
      error: "Valid price required." 
    }, { status: 400 });

    if (!unit?.trim()) return NextResponse.json({ 
      success: false, 
      error: "Unit is required." 
    }, { status: 400 });

    const service = await prisma.vendorService.create({
      data: {
        vendorId: (vendor as { id: string }).id,
        name: name.trim(),
        description: description?.trim() ?? null,
        basePrice,
        unit: unit.trim(),
        isActive: true,
      },
      select: {
        id: true, 
        name: true, 
        description: true,
        basePrice: true, 
        unit: true, 
        isActive: true, 
        createdAt: true,
        serviceAddons: { 
          select: { 
            id: true, 
            name: true, 
            price: true 
          } 
        },
      },
    });

    const s = service as Record<string, unknown>;
    const mapped = { ...s, addons: s.serviceAddons, serviceAddons: undefined };

    return NextResponse.json({ 
      success: true, 
      data: mapped, 
      message: "Service created!" 
    }, { status: 201 });
  } catch (err) {
    console.error("[CREATE_SERVICE]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create service." 
    }, { status: 500 });
  }
}