
import { prisma } from "@/lib/db/prisma";
import { notFound, redirect } from "next/navigation";

export async function getVendorBookingDetail(id: string, userId: string, userRole: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      agreedPrice: true,
      specialRequests: true,
      guestCount: true,
      createdAt: true,
      confirmedAt: true,
      vendor: { 
        select: { 
          id: true, 
          userId: true, 
          businessName: true 
        } 
      },
      event: {
        select: {
          id: true,
          title: true,
          type: true,
          eventDate: true,
          city: true,
          guestCount: true,
          budget: true,
          description: true,
          customer: {
            select: { 
              user: { 
                select: { 
                  id: true, 
                  name: true, 
                  email: true, 
                  phone: true 
                } 
              } 
            },
          },
        },
      },
      quotes: {
        orderBy: { version: "desc" },
        select: {
          id: true,
          version: true,
          status: true,
          totalAmount: true,
          subtotal: true,
          gstRate: true,
          gstAmount: true,
          validUntil: true,
          createdAt: true,
        },
      },
      payments: {
        orderBy: { createdAt: "asc" },
        select: { 
          id: true, 
          milestone: true, 
          amount: true, 
          status: true, 
          paidAt: true 
        },
      },
    },
  });

  if (!booking) notFound();

  if (booking.vendor.userId !== userId && userRole !== "ADMIN") {
    redirect("/vendor/dashboard");
  }

  const quotes = booking.quotes.map((q) => ({
    ...q,
    validUntil: q.validUntil.toISOString(),
  }));

  return {
    id:              booking.id,
    status:          booking.status,
    agreedPrice:     booking.agreedPrice,
    specialRequests: booking.specialRequests,
    guestCount:      booking.guestCount,
    createdAt:       booking.createdAt,
    confirmedAt:     booking.confirmedAt,
    vendor:          booking.vendor,
    event:           booking.event,
    payments:        booking.payments,
    quotes,
    latestQuote:    quotes[0] ?? null,
    canSendQuote:   ["INQUIRY", "NEGOTIATION"].includes(booking.status),
  };
}

export type VendorBookingDetail = Awaited<ReturnType<typeof getVendorBookingDetail>>;