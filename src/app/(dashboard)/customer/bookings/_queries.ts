
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";

export const getCustomerBookings = async (userId: string) => {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!customer) redirect("/customer/dashboard");

  const bookings = await prisma.booking.findMany({
    where: { event: { customerId: customer.id } },
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
            type: true 
        } 
    },
      vendor: { 
        select: { 
            id: true, 
            businessName: true, 
            category: true, 
            city: true 
        } 
    },
      quotes: {
        orderBy: { version: "desc" },
        take: 1,
        select: { 
            id: true, 
            totalAmount: true, 
            status: true, 
            version: true 
        },
      },
    },
  });

  const grouped: Record<"Active" | "Completed" | "Cancelled", typeof bookings> = {
    Active: [],
    Completed: [],
    Cancelled: [],
  };

  for (const b of bookings) {
    if (b.status === "COMPLETED") grouped.Completed.push(b);
    else if (["CANCELLED", "DISPUTED"].includes(b.status)) grouped.Cancelled.push(b);
    else grouped.Active.push(b);
  }

  return { bookings, grouped };
}

export type CustomerBookingsData = Awaited<ReturnType<typeof getCustomerBookings>>;
export type BookingListItem = CustomerBookingsData["bookings"][number];