
import { prisma } from "@/lib/db/prisma";

export async function getCustomerDashboardData(userId: string) {
  const customer = await prisma.customer.findUnique({ where: { userId } });
  if (!customer) return null;

  const [events, bookings, totalSpend] = await Promise.all([
    prisma.event.findMany({
      where: { customerId: customer.id },
      include: { bookings: { select: { id: true, status: true } } },
      orderBy: { eventDate: "desc" },
      take: 10,
    }),
    prisma.booking.findMany({
      where: { event: { customerId: customer.id } },
      include: {
        event: { select: { id: true, title: true, eventDate: true } },
        vendor: { select: { id: true, businessName: true, category: true, city: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.payment.aggregate({
      where: { booking: { event: { customerId: customer.id } }, status: "PAID" },
      _sum: { amount: true },
    }),
  ]);

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.eventDate) > now);
  const past = events.filter((e) => new Date(e.eventDate) <= now);
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED").length;

  return {
    events,
    upcoming,
    past,
    bookings,
    confirmedBookings,
    totalBookings: bookings.length,
    spent: Number(totalSpend._sum.amount ?? 0),
  };
}

export type CustomerDashboardData = NonNullable<Awaited<ReturnType<typeof getCustomerDashboardData>>>;