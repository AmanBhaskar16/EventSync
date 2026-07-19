// src/app/api/notifications/[id]/read/route.ts
// PATCH — mark single notification as read

import { NextRequest, NextResponse } from "next/server";
import { auth }   from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
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
    await prisma.notification.updateMany({
      where: { 
        id, 
        userId: session.user.id 
      },
      data:  { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[MARK_READ]", err);
    return NextResponse.json({ success: false, error: "Failed." }, { status: 500 });
  }
}