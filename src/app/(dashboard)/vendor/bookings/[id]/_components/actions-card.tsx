
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingActionButtons } from "@/components/bookings/booking-action-buttons";

export function ActionsCard({ bookingId, status }: { bookingId: string; status: string }) {
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Actions</CardTitle></CardHeader>
      <CardContent>
        <BookingActionButtons bookingId={bookingId} status={status} />
      </CardContent>
    </Card>
  );
}