
// Vendor downloads invoices + quotations for all completed bookings

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { FileText } from "lucide-react";
import { Card, CardContent} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DownloadInvoiceButton } from "@/components/documents/download-invoice-button";
import { formatDate, formatCurrency, BOOKING_STATUS_LABELS } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Documents" };

export default async function VendorDocumentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const vendor = await prisma.vendor.findUnique({
    where:  { userId: session.user.id },
    select: { id: true },
  });
  if (!vendor) redirect("/vendor/dashboard");

  const bookings = await prisma.booking.findMany({
    where: {
      vendorId: (vendor as { id: string }).id,
      status:   { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, 
      status: true, 
      agreedPrice: true, 
      confirmedAt: true,
      event: { 
          select: { 
            title: true, 
            eventDate: true 
          } 
        },
      quotes: {
        where:   { status: "ACCEPTED" },
        orderBy: { version: "desc" },
        take:    1,
        select:  { 
          totalAmount: true, 
          createdAt: true 
        },
      },
      payments: { 
        select: { 
              status: true, 
              amount: true 
            } 
        },
    },
  });

//   type BookingRow = typeof bookings[number];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Download invoices and quotations for your bookings.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <FileText className="size-12 mx-auto text-muted-foreground opacity-30" />
          <p className="font-medium text-lg">No documents yet</p>
          <p className="text-sm text-muted-foreground">
            Documents will appear here once you have confirmed bookings.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const event = b.event;
            const quotes = b.quotes;
            const payments = b.payments;
            const paidAmt = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
            const quote = quotes[0];

            return (
              <Card key={b.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{event.title}</p>
                        <Badge variant="outline" className="text-[10px]">
                          {BOOKING_STATUS_LABELS[b.status] ?? b.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Event date: {formatDate(event.eventDate)}
                      </p>
                      {b.confirmedAt && (
                        <p className="text-xs text-muted-foreground">
                          Confirmed: {formatDate(b.confirmedAt)}
                        </p>
                      )}
                      {quote && (
                        <p className="text-sm font-medium">
                          Quote total: {formatCurrency(quote.totalAmount)}
                          {paidAmt > 0 && (
                            <span className="text-green-600 ml-2">
                              · Paid: {formatCurrency(paidAmt)}
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <DownloadInvoiceButton bookingId={b.id} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}