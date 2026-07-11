

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star, ArrowLeft, Send } from "lucide-react";
import Link   from "next/link";
import { Button }    from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const DIMENSIONS = [
  { key: "punctuality", label: "Punctuality", desc: "Did they arrive and deliver on time?" },
  { key: "quality", label: "Quality of Work", desc: "How good was the final output?" },
  { key: "communication", label: "Communication", desc: "Were they responsive and clear?" },
  { key: "value", label: "Value for Money",  desc: "Was the price fair for what you got?" },
  { key: "professionalism", label: "Professionalism", desc: "Were they courteous and professional?" },
] as const;

type DimensionKey = typeof DIMENSIONS[number]["key"];

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [ratings, setRatings]   = useState<Record<DimensionKey, number>>({
    punctuality: 0, 
    quality: 0, 
    communication: 0, 
    value: 0, 
    professionalism: 0,
  });
  const [comment,  setComment]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [hovered,  setHovered]  = useState<Record<DimensionKey, number>>({
    punctuality: 0, quality: 0, communication: 0, value: 0, professionalism: 0,
  });

  const allRated  = Object.values(ratings).every((r) => r > 0);
  const avgRating = allRated ? (Object.values(ratings).reduce((s, r) => s + r, 0) / 5).toFixed(1) : "—";

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    if (!allRated) { 
      toast.error("Please rate all 5 dimensions."); 
      return; 
    }

    setLoading(true);

    try {
      const res  = await fetch("/api/reviews", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ bookingId: id, ...ratings, comment: comment || undefined }),
      });

      const data = await res.json() as { 
        success: boolean; 
        error?: string 
      };

      if (!data.success) { 
        toast.error(data.error ?? "Failed."); 
        return; 
      }

      toast.success("Review submitted! Thank you.");
      router.push(`/customer/bookings/${id}`);
    } catch { 
      toast.error("Network error."); 
    }
    finally   { 
      setLoading(false); 
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={`/customer/bookings/${id}`}><ArrowLeft className="size-4" /> Back</Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leave a Review</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Rate your experience across 5 dimensions.
        </p>
      </div>

      {/* Overall preview */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Overall rating</span>
        <div className="flex items-center gap-2">
          <Star className={cn("size-5", allRated ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
          <span className="text-2xl font-bold">{avgRating}</span>
          <span className="text-sm text-muted-foreground">/ 5</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Rate each dimension</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {DIMENSIONS.map(({ key, label, desc }) => (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <span className="text-sm font-bold w-6 text-right">
                    {ratings[key] || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatings((r) => ({ ...r, [key]: star }))}
                      onMouseEnter={() => setHovered((h) => ({ ...h, [key]: star }))}
                      onMouseLeave={() => setHovered((h) => ({ ...h, [key]: 0 }))}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star className={cn(
                        "size-7 transition-colors",
                        (hovered[key] || ratings[key]) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      )} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <FormField label="Comment (optional)" htmlFor="comment">
          <textarea id="comment" rows={4}
            placeholder="Share your experience — what went well, what could improve…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground resize-none" />
        </FormField>

        <Button type="submit" className="w-full" size="lg" loading={loading} disabled={!allRated}>
          <Send className="size-4" /> Submit Review
        </Button>
      </form>
    </div>
  );
}