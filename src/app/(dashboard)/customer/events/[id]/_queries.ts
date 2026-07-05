
import { prisma } from "@/lib/db/prisma";
import { notFound, redirect } from "next/navigation";

export async function getCustomerEventDetail(id: string, userId: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      eventDate: true,
      city: true,
      state: true,
      venue: true,
      guestCount: true,
      budget: true,
      description: true,
      createdAt: true,
      customer: { select: { userId: true } },
      bookings: {
        select: {
          id: true,
          status: true,
          agreedPrice: true,
          createdAt: true,
          vendor: {
            select: { id: true, businessName: true, category: true, city: true, avgRating: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!event) notFound();
  if (event.customer.userId !== userId) redirect("/customer/events");

  const totalSpend = event.bookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((s, b) => s + (b.agreedPrice ?? 0), 0);

  return { ...event, totalSpend };
}

export type CustomerEventDetail = Awaited<ReturnType<typeof getCustomerEventDetail>>;
export type EventBookingRow = CustomerEventDetail["bookings"][number];

export const EVENT_STATUS_BADGE: Record<string, string> = {
  DRAFT:       "bg-gray-100 text-gray-800",
  PLANNING:    "bg-blue-100 text-blue-800",
  CONFIRMED:   "bg-green-100 text-green-800",
  IN_PROGRESS: "bg-cyan-100 text-cyan-800",
  COMPLETED:   "bg-purple-100 text-purple-800",
  CANCELLED:   "bg-red-100 text-red-800",
};