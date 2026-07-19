// src/app/api/notifications/route.ts
// GET — get notifications for current user

import { NextResponse }  from "next/server";
import { auth }   from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });

    const notifications = await prisma.notification.findMany({
      where:   { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take:    50,
      select: {
        id: true, 
        type: true, 
        title: true,
        message: true, 
        link: true, 
        isRead: true, 
        createdAt: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: notifications 
    });
  } catch (err) {
    console.error("[GET_NOTIFICATIONS]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed." 
    }, { status: 500 });
  }
}