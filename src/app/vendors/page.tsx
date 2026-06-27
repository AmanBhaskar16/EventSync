
// Public page — search + filter sidebar + results grid

import { Suspense } from "react";
import type { Metadata } from "next";
import { Users } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { SearchBar } from "@/components/shared/search-bar";
import { VendorFilters } from "@/components/vendors/vendor-filters";
import { VendorSearchResults } from "@/components/vendors/vendor-search-results";
import { Badge } from "@/components/ui/badge";
import { VENDOR_CATEGORY_LABELS } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Find Vendors | EventSync",
  description: "Browse 2,400+ verified vendors for your event.",
};

const FEATURED_CATEGORIES = [
  { key: "CATERING",emoji: "🍽️" },
  { key: "DECOR", emoji: "🌸" },
  { key: "PHOTOGRAPHY", emoji: "📸" },
  { key: "VENUE", emoji: "🏛️" },
  { key: "DJ_MUSIC",emoji: "🎵" },
  { key: "MAKEUP_ARTIST", emoji: "💄" },
  { key: "FLORALS", emoji: "💐" },
  { key: "MEHENDI", emoji: "🌿" },
];

function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-48 rounded bg-muted animate-pulse" />
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border overflow-hidden animate-pulse">
            <div className="h-44 bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-2/3 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VendorsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero header */}
      <div className="border-b border-border bg-linear-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <Users className="size-3" /> 2,400+ verified vendors
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Find the perfect vendor</h1>
            <p className="text-muted-foreground">KYC-verified professionals across 17 categories.</p>
          </div>

          <Suspense>
            <SearchBar className="max-w-2xl" />
          </Suspense>

          {/* Quick category chips */}
          <div className="flex flex-wrap gap-2">
            {FEATURED_CATEGORIES.map(({ key, emoji }) => (
              <a
                key={key}
                href={`/vendors?category=${key}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background hover:border-primary/40 hover:bg-primary/5 px-3.5 py-1.5 text-xs font-medium transition-colors"
              >
                <span>{emoji}</span>
                {VENDOR_CATEGORY_LABELS[key]}
              </a>
            ))}
            <Link href="/vendors" className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border bg-background hover:border-primary/40 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors">
              + 9 more
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sticky filter sidebar */}
          <div className="hidden lg:block w-56 xl:w-64 shrink-0">
            <div className="sticky top-20">
              <Suspense>
                <VendorFilters />
              </Suspense>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <Suspense fallback={<ResultsSkeleton />}>
              <VendorSearchResults />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}