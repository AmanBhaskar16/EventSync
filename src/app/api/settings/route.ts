
// GET  — get current user profile
// PATCH — update profile

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });

    const user = await prisma.user.findUnique({
      where:  { id: session.user.id },
      select: {
        id: true, 
        name: true, 
        email: true, 
        phone: true,
        avatar: true, 
        role: true, 
        createdAt: true,
        vendor: {
          select: {
            id: true, 
            businessName: true, 
            category: true, 
            description: true,
            city: true, 
            state: true, 
            pincode: true, 
            serviceRadius: true,
            gstin: true, 
            pan: true, 
            bankName: true, 
            bankAccountNo: true, 
            bankIfsc: true,
            kycStatus: true, 
            isVerified: true, 
            avgRating: true,
            totalReviews: true, 
            totalBookings: true,
          },
        },
        customer: {
          select: { 
            id: true, 
            address: true, 
            city: true, 
            state: true, 
            pincode: true 
          },
        },
      },
    });

    if (!user) return NextResponse.json({ 
      success: false, 
      error: "User not found." 
    }, { status: 404 });

    return NextResponse.json({ 
      success: true, 
      data: user 
    });

  } catch (err) {
    console.error("[GET_SETTINGS]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch settings."
    }, { status: 500 });
  }
}

export const PATCH = async (req: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ 
      success: false, 
      error: "Unauthenticated." 
    }, { status: 401 });

    const body = await req.json() as {
      name?:        string;
      phone?:       string;
      // password change
      currentPassword?: string;
      newPassword?:     string;
      // vendor specific
      businessName?: string;
      description?:  string;
      city?:         string;
      state?:        string;
      pincode?:      string;
      serviceRadius?: number;
      gstin?:        string;
      pan?:          string;
      bankName?:     string;
      bankAccountNo?: string;
      bankIfsc?:     string;
      // customer specific
      address?:      string;
    };

    // Update user table
    const userData: Record<string, unknown> = {};
    
    if (body.name?.trim())  userData.name  = body.name.trim();
    if (body.phone?.trim()) userData.phone = body.phone.trim();

    // Password change
    if (body.currentPassword && body.newPassword) {
      const user = await prisma.user.findUnique({
        where:  { id: session.user.id },
        select: { passwordHash: true },
      });

      const u = user as { passwordHash: string | null } | null;

      if (!u?.passwordHash) {
        return NextResponse.json({ 
          success: false, 
          error: "No password set." 
        }, { status: 400 });
      }
      const valid = await bcrypt.compare(body.currentPassword, u.passwordHash);

      if (!valid) {
        return NextResponse.json({ 
          success: false, 
          error: "Current password is incorrect." 
        }, { status: 400 });
      }
      if (body.newPassword.length < 8) {
        return NextResponse.json({ 
          success: false, 
          error: "New password must be at least 8 characters." 
        }, { status: 400 });
      }
      userData.passwordHash = await bcrypt.hash(body.newPassword, 12);
    }

    if (Object.keys(userData).length > 0) {
      await prisma.user.update({ 
        where: { id: session.user.id }, 
        data: userData 
      });
    }

    // Update vendor profile
    if (session.user.role === "VENDOR") {
      const vendorData: Record<string, unknown> = {};
      if (body.businessName !== undefined) vendorData.businessName  = body.businessName;
      if (body.description  !== undefined) vendorData.description   = body.description;
      if (body.city !== undefined) vendorData.city = body.city;
      if (body.state !== undefined) vendorData.state = body.state;
      if (body.pincode !== undefined) vendorData.pincode = body.pincode;
      if (body.serviceRadius!== undefined) vendorData.serviceRadius = body.serviceRadius;
      if (body.gstin !== undefined) vendorData.gstin = body.gstin;
      if (body.pan !== undefined) vendorData.pan = body.pan;
      if (body.bankName !== undefined) vendorData.bankName = body.bankName;
      if (body.bankAccountNo!== undefined) vendorData.bankAccountNo = body.bankAccountNo;
      if (body.bankIfsc !== undefined) vendorData.bankIfsc = body.bankIfsc;

      if (Object.keys(vendorData).length > 0) {
        await prisma.vendor.update({ 
          where: { userId: session.user.id }, 
          data: vendorData 
        });
      }
    }

    // Update customer profile
    if (session.user.role === "CUSTOMER") {
      const customerData: Record<string, unknown> = {};
      if (body.address !== undefined) customerData.address = body.address;
      if (body.city !== undefined) customerData.city = body.city;
      if (body.state !== undefined) customerData.state = body.state;
      if (body.pincode !== undefined) customerData.pincode = body.pincode;

      if (Object.keys(customerData).length > 0) {
        await prisma.customer.update({ 
          where: { userId: session.user.id }, 
          data: customerData 
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Settings saved." 
    });

  } catch (err) {
    console.error("[UPDATE_SETTINGS]", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to save settings." 
    }, { status: 500 });
  }
}