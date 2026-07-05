
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";

export const getCustomerEvents = async (userId: string) => {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!customer) redirect("/customer/dashboard");

  const events = await prisma.event.findMany({
    where: { customerId: customer.id },
    orderBy: { eventDate: "asc" },
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      eventDate: true,
      city: true,
      guestCount: true,
      budget: true,
      bookings: { select: { id: true, status: true } },
    },
  });

  const now = new Date();
  return {
    events,
    upcoming: events.filter((e) => new Date(e.eventDate) >= now),
    past: events.filter((e) => new Date(e.eventDate) <  now),
  };
}

export type CustomerEventsData = Awaited<ReturnType<typeof getCustomerEvents>>;
export type EventListItem = CustomerEventsData["events"][number];

export const EVENT_STATUS_COLOR: Record<string, string> = {
  DRAFT:       "bg-gray-100 text-gray-700",
  PLANNING:    "bg-blue-100 text-blue-700",
  CONFIRMED:   "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-cyan-100 text-cyan-700",
  COMPLETED:   "bg-purple-100 text-purple-700",
  CANCELLED:   "bg-red-100 text-red-700",
};