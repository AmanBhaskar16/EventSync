
// URL-driven filter sidebar — all state lives in URL params

"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { X, SlidersHorizontal } from "lucide-react";
// import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Badge }  from "@/components/ui/badge";
import { cn, VENDOR_CATEGORY_LABELS } from "@/lib/utils";

const CITIES = ["Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Kolkata","Pune","Ahmedabad","Jaipur","Surat","Lucknow","Chandigarh"];
const RATING_OPTIONS = [{ value: "4.5", label: "4.5+ Excellent" }, { value: "4", label: "4.0+ Very Good" }, { value: "3.5", label: "3.5+ Good" }];
const SORT_OPTIONS   = [{ value: "rating", label: "Highest rated" }, { value: "bookings", label: "Most booked" }];

export function VendorFilters({ className }: { className?: string }) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();

  const get = (key: string) => params.get(key) ?? "";

  const setParam = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }, [params, pathname, router]);

  const clearAll = useCallback(() => router.push(pathname), [pathname, router]);

  const activeCount = ["category","city","minRating","minPrice","maxPrice"].filter((k) => !!params.get(k)).length;

  return (
    <aside className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Filters</span>
          {activeCount > 0 && <Badge variant="default" className="text-[10px] px-1.5 py-0.5">{activeCount}</Badge>}
        </div>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-xs text-primary hover:underline flex items-center gap-1">
            <X className="size-3" /> Clear all
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sort by</p>
        {SORT_OPTIONS.map((o) => (
          <button key={o.value} onClick={() => setParam("sortBy", o.value)}
            className={cn("w-full text-left text-xs px-3 py-2 rounded-md transition-colors",
              get("sortBy") === o.value || (!get("sortBy") && o.value === "rating")
                ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted")}>
            {o.label}
          </button>
        ))}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</p>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          {Object.entries(VENDOR_CATEGORY_LABELS).map(([value, label]) => {
            const active = get("category") === value;
            return (
              <button key={value} onClick={() => setParam("category", active ? "" : value)}
                className={cn("w-full text-left text-xs px-3 py-2 rounded-md transition-colors",
                  active ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted")}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* City */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">City</p>
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          {CITIES.map((city) => {
            const active = get("city") === city;
            return (
              <button key={city} onClick={() => setParam("city", active ? "" : city)}
                className={cn("w-full text-left text-xs px-3 py-2 rounded-md transition-colors",
                  active ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted")}>
                {city}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Min Rating</p>
        {RATING_OPTIONS.map((o) => (
          <button key={o.value} onClick={() => setParam("minRating", get("minRating") === o.value ? "" : o.value)}
            className={cn("w-full text-left text-xs px-3 py-2 rounded-md transition-colors",
              get("minRating") === o.value ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted")}>
            {o.label}
          </button>
        ))}
      </div>

      {/* Budget */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Budget (₹)</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Min</p>
            <Input type="number" placeholder="0" className="h-8 text-xs"
              defaultValue={get("minPrice")}
              onBlur={(e) => setParam("minPrice", e.target.value)} />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Max</p>
            <Input type="number" placeholder="Any" className="h-8 text-xs"
              defaultValue={get("maxPrice")}
              onBlur={(e) => setParam("maxPrice", e.target.value)} />
          </div>
        </div>
      </div>
    </aside>
  );
}