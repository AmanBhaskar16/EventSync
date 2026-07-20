
import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/shared/star-rating";
import { formatRelativeTime } from "@/lib/utils/format";
import type { Review, AvgDimensions } from "../_queries";

// ── Local sub-components (only used here, no need to extract further) ──

const AVATAR_COLORS = [
  "bg-primary/15 text-primary",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
];

const RatingBar = ({ label, value }: { label: string; value: number }) => {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-32 text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-amber-400" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
      <span className="text-xs font-medium w-6 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const colorIdx = review.reviewerName.charCodeAt(0) % AVATAR_COLORS.length;
  const dimensions = [
    { label: "Punctuality",val: review.punctuality },
    { label: "Quality",val: review.quality },
    { label: "Communication", val: review.communication },
    { label: "Value",val: review.value },
    { label: "Professional",val: review.professionalism },
  ];

  return (
    <div className="rounded-xl border border-border p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`size-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${AVATAR_COLORS[colorIdx]}`}>
            {review.reviewerName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold">{review.reviewerName}</p>
            <p className="text-xs text-muted-foreground">{formatRelativeTime(review.createdAt)}</p>
          </div>
        </div>
        <StarRating rating={review.overallRating} size="sm" />
      </div>

      {review.comment && (
        <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
      )}

      <div className="grid grid-cols-5 gap-2 text-center">
        {dimensions.map(({ label, val }) => (
          <div key={label}>
            <div className="text-[10px] text-muted-foreground">{label}</div>
            <div className="text-xs font-bold">{val}/5</div>
          </div>
        ))}
      </div>

      {review.vendorReply && (
        <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Vendor replied</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{review.vendorReply}</p>
        </div>
      )}
    </div>
  );
}

// ── Main export ──

export const ReviewsSection = ({
  reviews,
  totalReviews,
  avgRating,
  avgDimensions,
}: {
  reviews: Review[];
  totalReviews: number;
  avgRating: number;
  avgDimensions: AvgDimensions | null;
}) =>{
  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold flex items-center gap-2">
        <MessageSquare className="size-4 text-muted-foreground" />
        Reviews {totalReviews > 0 && <span className="text-muted-foreground font-normal">({totalReviews})</span>}
      </h2>

      {avgDimensions && (
        <Card>
          <CardContent className="p-5">
            <div className="flex gap-8 flex-wrap">
              <div className="flex flex-col items-center justify-center">
                <span className="text-5xl font-bold">{avgRating.toFixed(1)}</span>
                <StarRating rating={avgRating} showValue={false} size="sm" />
                <span className="text-xs text-muted-foreground mt-1">{totalReviews} review{totalReviews !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex-1 min-w-50 space-y-2">
                <RatingBar label="Punctuality" value={avgDimensions.punctuality} />
                <RatingBar label="Quality" value={avgDimensions.quality} />
                <RatingBar label="Communication" value={avgDimensions.communication} />
                <RatingBar label="Value for money" value={avgDimensions.value} />
                <RatingBar label="Professionalism" value={avgDimensions.professionalism} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground space-y-2">
          <MessageSquare className="size-8 mx-auto opacity-30" />
          <p className="text-sm">No reviews yet. Be the first to book and review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
        </div>
      )}
    </section>
  );
}