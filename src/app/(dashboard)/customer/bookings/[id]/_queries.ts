import { prisma } from "@/lib/db/prisma";
import { notFound, redirect } from "next/navigation";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export async function getCustomerBookingDetail(id: string, userId: string, userRole: string) {
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
      cancelReason: true,
      event: {
        select: {
          id: true,
          title: true,
          type: true,
          eventDate: true,
          city: true,
          customer: { 
            select: { 
              user: { 
                select: { 
                  id: true, 
                  name: true 
                } 
              } 
            } 
          },
        },
      },
      vendor: {
        select: {
          id: true,
          businessName: true,
          category: true,
          city: true,
          state: true,
          avgRating: true,
          responseTime: true,
          isVerified: true,
        },
      },
      quotes: {
        orderBy: { version: "desc" },
        select: {
          id: true,
          version: true,
          status: true,
          lineItems: true,
          subtotal: true,
          gstRate: true,
          gstAmount: true,
          totalAmount: true,
          validUntil: true,
          notes: true,
          terms: true,
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
      review:  { 
        select: { 
          id: true, 
          overallRating: true, 
          comment: true 
        } 
      },
      dispute: { 
        select: { 
          id: true, 
          reason: true, 
          status: true 
        } 
      },
    },
  });

  if (!booking) notFound();

  if (booking.event.customer.user.id !== userId && userRole !== "ADMIN") {
    redirect("/customer/dashboard");
  }

  const quotes = booking.quotes.map((q) => ({
    ...q,
    lineItems:  q.lineItems  as unknown as LineItem[],
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
    cancelReason:    booking.cancelReason,
    event:           booking.event,
    vendor:          booking.vendor,
    payments:        booking.payments,
    review:          booking.review,
    dispute:         booking.dispute,
    quotes,
    latestQuote: quotes[0] ?? null,
  };
}

export type CustomerBookingDetail = Awaited<ReturnType<typeof getCustomerBookingDetail>>;