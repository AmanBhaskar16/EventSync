
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/shared/star-rating";
import type { CustomerBookingDetail } from "../_queries";

export function ReviewCard({
  review,
}: {
  review: NonNullable<CustomerBookingDetail["review"]>;
}) {
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Your Review</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <StarRating rating={review.overallRating} size="md" />
        {review.comment && (
          <p className="text-sm text-muted-foreground italic">&ldquo;{review.comment}&rdquo;</p>
        )}
      </CardContent>
    </Card>
  );
}