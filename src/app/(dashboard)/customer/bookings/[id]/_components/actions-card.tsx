
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TERMINAL_STATUSES = ["CANCELLED", "COMPLETED", "DISPUTED"];

export const ActionsCard = ({
  bookingId,
  status,
  hasReview,
  hasDispute,
}: {
  bookingId: string;
  status: string;
  hasReview: boolean;
  hasDispute: boolean;
}) => {
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Actions</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {!TERMINAL_STATUSES.includes(status) && (
          <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
            Cancel booking
          </Button>
        )}
        {status === "COMPLETED" && !hasReview && (
          <Button size="sm" className="w-full" asChild>
            <Link href={`/customer/bookings/${bookingId}/review`}>Leave a review</Link>
          </Button>
        )}
        {status === "COMPLETED" && !hasDispute && (
          <Button variant="outline" size="sm" className="w-full">Raise a dispute</Button>
        )}
      </CardContent>
    </Card>
  );
}
