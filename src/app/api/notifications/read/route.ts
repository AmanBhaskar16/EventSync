// src/app/api/notifications/read/route.ts
// PATCH — mark all notifications as read

import { NextResponse } from "next/server";
import { auth }   from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function PATCH() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });

    await prisma.notification.updateMany({
      where: { 
        userId: session.user.id, 
        isRead: false 
      },
      data:  { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[MARK_ALL_READ]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed." 
    }, { status: 500 });
  }
}