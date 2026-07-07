
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";

export const ROLE_LABELS: Record<string, string> = {
  MANAGER: "Manager", 
  CHEF: "Chef", 
  ASSISTANT: "Assistant",
  DRIVER: "Driver", 
  COORDINATOR: "Coordinator", 
  PHOTOGRAPHER: "Photographer",
  DECORATOR: "Decorator", 
  SECURITY: "Security", 
  OTHER: "Other",
};

const getVendorStaff = async (userId: string) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!vendor) redirect("/vendor/dashboard");

  const staff = await prisma.staffMember.findMany({
    where: { vendorId: vendor.id },
    orderBy: { name: "asc" },
    select: {
      id: true, 
      name: true, 
      role: true, 
      phone: true,
      email: true, 
      dailyRate: true, 
      isActive: true,
      assignments: {
        orderBy: { date: "desc" },
        take: 3,
        select: { 
            id: true, 
            date: true, 
            bookingId: true 
        },
      },
    },
  });

  return {
    staff,
    active: staff.filter((s) => s.isActive),
    inactive: staff.filter((s) => !s.isActive),
  };
}
export default getVendorStaff;
export type VendorStaffData = Awaited<ReturnType<typeof getVendorStaff>>;
export type StaffMember = VendorStaffData["staff"][number];