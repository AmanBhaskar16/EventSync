
// POST — upload user avatar

import { NextRequest, NextResponse } from "next/server";
import { auth }               from "@/lib/auth";
import { prisma }             from "@/lib/db/prisma";
import { uploadToCloudinary } from "@/lib/uploads/cloudinary";

export const POST = async (req: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ 
      success: false, 
      error: "No file provided." 
    }, { status: 400 });

    if (!file.type.startsWith("image/")) return NextResponse.json({ 
      success: false, 
      error: "Only images allowed." 
    }, { status: 400 });

    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ 
      success: false, 
      error: "Max file size is 5MB." 
    }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadToCloudinary(buffer, "eventsync/avatars", {
      width: 400, 
      height: 400, 
      quality: 85,
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data:  { avatar: url },
    });

    return NextResponse.json({ 
      success: true, 
      data: { url }, 
      message: "Avatar updated!" 
    });

  } catch (err) {
    console.error("[UPLOAD_AVATAR]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to upload avatar." 
    }, { status: 500 });
  }
}