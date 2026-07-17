
// POST — upload vendor portfolio images (max 8)
// DELETE — remove a portfolio image

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/uploads/cloudinary";

export const POST = async (req: NextRequest) => {
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
      select: { 
        id: true, 
        portfolioImages: true 
      },
    });

    if (!vendor) return NextResponse.json({ 
      success: false, 
      error: "Vendor not found." 
    }, { status: 404 });

    const v = vendor as { id: string; portfolioImages: string[] };

    if (v.portfolioImages.length >= 8) {
      return NextResponse.json({ 
        success: false, 
        error: "Maximum 8 portfolio images allowed." 
      }, { status: 400 });
    }

    const formData = await req.formData();
    const files    = formData.getAll("files") as File[];

    if (!files.length) return NextResponse.json({ 
      success: false, 
      error: "No files provided." 
    }, { status: 400 });

    const remaining = 8 - v.portfolioImages.length;
    const toUpload  = files.slice(0, remaining);

    const uploaded: string[] = [];
    for (const file of toUpload) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) continue; // skip > 10MB
      const buffer   = Buffer.from(await file.arrayBuffer());
      const { url }  = await uploadToCloudinary(buffer, "eventsync/portfolio", {
        width: 1200, 
        height: 900, 
        quality: 85,
      });
      uploaded.push(url);
    }

    const newImages = [...v.portfolioImages, ...uploaded];
    await prisma.vendor.update({
      where: { id: v.id },
      data:  { portfolioImages: newImages },
    });

    return NextResponse.json({
      success: true,
      data:    { portfolioImages: newImages },
      message: `${uploaded.length} image(s) uploaded.`,
    });
  } catch (err) {
    console.error("[UPLOAD_PORTFOLIO]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to upload images." 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "VENDOR") {
      return NextResponse.json({ 
        success: false, 
        error: "Vendors only." 
      }, { status: 403 });
    }

    const body     = await req.json() as { imageUrl: string };
    const { imageUrl } = body;

    const vendor = await prisma.vendor.findUnique({
      where:  { userId: session.user.id },
      select: { 
        id: true, 
        portfolioImages: true 
      },
    });

    if (!vendor) return NextResponse.json({ 
      success: false, 
      error: "Vendor not found." 
    }, { status: 404 });

    const v = vendor as { id: string; portfolioImages: string[] };

    // Extract public_id from Cloudinary URL and delete
    try {
      const urlParts = imageUrl.split("/");
      const filename = urlParts[urlParts.length - 1].split(".")[0];
      const folder   = urlParts[urlParts.length - 2];
      await deleteFromCloudinary(`eventsync/${folder}/${filename}`);
    } catch { /* ignore delete errors */ }

    const newImages = v.portfolioImages.filter((img) => img !== imageUrl);
    await prisma.vendor.update({
      where: { id: v.id },
      data:  { portfolioImages: newImages },
    });

    return NextResponse.json({ 
      success: true, 
      data: { portfolioImages: newImages }, 
      message: "Image removed." 
    });
  } catch (err) {
    console.error("[DELETE_PORTFOLIO]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to delete image." 
    }, { status: 500 });
  }
}