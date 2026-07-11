
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomerActionButtons } from "@/components/bookings/customer-action-buttons";
import type { CustomerBookingDetail } from "../_queries";

const DISPUTE_ELIGIBLE = ["CONFIRMED", "IN_PROGRESS", "COMPLETED"];

export function ActionsCard({
  bookingId,
  status,
  payments,
  review,
  dispute,
}: {
  bookingId: string;
  status: string;
  payments: CustomerBookingDetail["payments"];
  review: CustomerBookingDetail["review"];
  dispute: CustomerBookingDetail["dispute"];
}) {
  const canRaiseDispute = DISPUTE_ELIGIBLE.includes(status) && !dispute;

  const allPaid =
    status === "COMPLETED" &&
    !review &&
    payments.length === 3 &&
    payments.every((p) => p.status === "PAID");

  const showPaymentPrompt = status === "COMPLETED" && !review && !allPaid;

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Actions</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <CustomerActionButtons bookingId={bookingId} status={status} />

        {canRaiseDispute && (
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={`/customer/bookings/${bookingId}/dispute`}>Raise a dispute</Link>
          </Button>
        )}

        {allPaid && (
          <Button size="sm" className="w-full" asChild>
            <Link href={`/customer/bookings/${bookingId}/review`}>Leave a review</Link>
          </Button>
        )}

        {showPaymentPrompt && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center">
            <p className="text-xs text-amber-700 font-medium">
              Complete all 3 payments to leave a review
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}