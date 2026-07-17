
// POST — vendor uploads KYC documents

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { uploadToCloudinary } from "@/lib/uploads/cloudinary";

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
        kycStatus: true 
      },
    });

    if (!vendor) return NextResponse.json({ 
      success: false, 
      error: "Vendor not found." 
    }, { status: 404 });

    const v = vendor as { id: string; kycStatus: string };
    if (v.kycStatus === "APPROVED") {
      return NextResponse.json({ 
        success: false, 
        error: "KYC already approved." 
      }, { status: 400 });
    }

    const formData = await req.formData();
    const files  = formData.getAll("files") as File[];

    if (!files.length) return NextResponse.json({ 
      success: false, 
      error: "No files provided." 
    }, { status: 400 });

    const uploaded: string[] = [];
    for (const file of files.slice(0, 5)) {
      if (file.size > 10 * 1024 * 1024) continue;
      const buffer  = Buffer.from(await file.arrayBuffer());
      const { url } = await uploadToCloudinary(buffer, "eventsync/kyc", {
        width: 1600, 
        quality: 90,
      });
      uploaded.push(url);
    }

    // Save KYC docs + update status to UNDER_REVIEW
    await prisma.vendor.update({
      where: { id: v.id },
      data:  {
        kycDocuments: uploaded,
        kycStatus:    "UNDER_REVIEW",
      },
    });

    return NextResponse.json({
      success: true,
      data:    { kycDocuments: uploaded },
      message: "KYC documents submitted. Under review.",
    });

  } catch (err) {
    console.error("[UPLOAD_KYC]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to upload KYC documents." 
    }, { status: 500 });
  }
}