
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { SettingsClient } from "./_components/settings-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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
          portfolioImages: true, 
          kycDocuments: true,
        },
      },
      customer: {
        select: { 
          address: true, 
          city: true, 
          state: true, 
          pincode: true 
        },
      },
    },
  });

  if (!user) redirect("/login");

  const userData = {
    ...user,
    createdAt: user.createdAt.toISOString(),
    role: user.role as string,
  };

  return <SettingsClient userData={userData} />;
}