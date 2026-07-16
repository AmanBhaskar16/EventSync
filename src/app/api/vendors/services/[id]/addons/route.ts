
// POST   — add addon to service
// DELETE — remove addon

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(
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

    const { id: serviceId } = await params;
    const body = await req.json() as { 
      name: string; 
      price: number 
    };
    const { name, price } = body;

    if (!name?.trim()) return NextResponse.json({ 
      success: false, 
      error: "Addon name required." 
    }, { status: 400 });
    if (price === undefined || price < 0) return NextResponse.json({ 
      success: false, 
      error: "Valid price required." 
    }, { status: 400 });

    const service = await prisma.vendorService.findUnique({
      where:  { id: serviceId },
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

    const addon = await prisma.serviceAddon.create({
      data:   { 
        serviceId, 
        name: name.trim(), 
        price 
      },
      select: { 
        id: true, 
        name: true, 
        price: true 
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: addon, 
      message: "Addon added." 
    }, { status: 201 });
  } catch (err) {
    console.error("[CREATE_ADDON]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to add addon." 
    }, { status: 500 });
  }
}

export async function DELETE(
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

    const { id: serviceId } = await params;
    const body = await req.json() as { addonId: string };
    const { addonId } = body;

    const service = await prisma.vendorService.findUnique({
      where:  { id: serviceId },
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

    await prisma.serviceAddon.delete({ where: { id: addonId } });
    return NextResponse.json({ 
      success: true, 
      message: "Addon removed." 
    });
  } catch (err) {
    console.error("[DELETE_ADDON]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to remove addon." 
    }, { status: 500 });
  }
}