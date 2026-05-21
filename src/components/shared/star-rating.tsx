import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number; max?: number;
  size?: "sm" | "md" | "lg"; showValue?: boolean; className?: string;
}

export function StarRating({ rating, max = 5, size = "md", showValue = true, className }: StarRatingProps) {
  const sizeMap = { sm: "size-3", md: "size-4", lg: "size-5" };
  const textMap = { sm: "text-xs", md: "text-sm", lg: "text-base" };

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="inline-flex gap-0.5">
        {Array.from({ length: max }, (_, i) => {
          const fill = Math.min(Math.max(rating - i, 0), 1);
          return (
            <svg key={i} className={cn(sizeMap[size], "shrink-0")} viewBox="0 0 16 16" fill="none">
              <defs>
                <linearGradient id={`sg-${i}-${rating}`}>
                  <stop offset={`${fill * 100}%`} stopColor="#f59e0b" />
                  <stop offset={`${fill * 100}%`} stopColor="#f59e0b" stopOpacity="0.25" />
                </linearGradient>
              </defs>
              <path d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9L4.4 12.5l.7-4L2.2 5.7l4-.6L8 1.5z"
                fill={`url(#sg-${i}-${rating})`} stroke="#f59e0b" strokeWidth="0.8" />
            </svg>
          );
        })}
      </span>
      {showValue && <span className={cn("font-medium", textMap[size])}>{rating.toFixed(1)}</span>}
    </span>
  );
}