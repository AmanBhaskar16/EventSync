
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";

export const PIPELINE_STAGES = [
  { key: "INQUIRY", label: "New Inquiries", color: "border-blue-300 bg-blue-50", dotColor: "#93c5fd" },
  { key: "QUOTE_SENT", label: "Quote Sent", color: "border-purple-300 bg-purple-50", dotColor: "#c4b5fd" },
  { key: "NEGOTIATION", label: "Negotiation", color: "border-amber-300 bg-amber-50", dotColor: "#fcd34d" },
  { key: "CONFIRMED", label: "Confirmed", color: "border-green-300 bg-green-50", dotColor: "#86efac" },
  { key: "IN_PROGRESS", label: "In Progress", color: "border-cyan-300 bg-cyan-50", dotColor: "#67e8f9" },
  { key: "COMPLETED", label: "Completed", color: "border-gray-300 bg-gray-50", dotColor: "#d1d5db" },
] as const;

export const getVendorBookingsPipeline = async (userId: string) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!vendor) redirect("/vendor/dashboard");

  const bookings = await prisma.booking.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      agreedPrice: true,
      createdAt: true,
      event: {
        select: {
          id: true,
          title: true,
          eventDate: true,
          city: true,
          type: true,
          customer: { 
            select: { 
              user: { 
                select: { 
                  name: true 
                } 
              } 
            } 
          },
        },
      },
      quotes: {
        orderBy: { version: "desc" },
        take: 1,
        select: { 
          totalAmount: true, 
          status: true 
        },
      },
    },
  });

  const grouped: Record<string, typeof bookings> = {};
  for (const stage of PIPELINE_STAGES) grouped[stage.key] = [];
  for (const b of bookings) {
    if (grouped[b.status]) grouped[b.status].push(b);
  }

  const activeCount = bookings.filter(
    (b) => !["COMPLETED", "CANCELLED", "DISPUTED"].includes(b.status)
  ).length;

  return { bookings, grouped, activeCount };
}

export type VendorBookingsPipelineData = Awaited<ReturnType<typeof getVendorBookingsPipeline>>;
export type PipelineBooking = VendorBookingsPipelineData["bookings"][number];