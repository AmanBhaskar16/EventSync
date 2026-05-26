// Used in the /vendors search results grid
import Link           from "next/link";
import { MapPin, Clock, Star, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { cn, formatCurrency, VENDOR_CATEGORY_LABELS } from "@/lib/utils";

export type VendorCardData = {
  id: string; 
  businessName: string; 
  category: string; 
  description: string | null;
  city: string; 
  state: string; 
  avgRating: number; 
  totalReviews: number;
  totalBookings: number; 
  responseTime: number; 
  isVerified: boolean; 
  tier: string;
  portfolioImages: string[];
  services: { 
    id: string; 
    name: string;
    basePrice: number; 
    unit: string 
  }[];
};

const GRAD = [
  "from-primary/20 to-primary/5", "from-blue-500/20 to-blue-500/5",
  "from-green-500/20 to-green-500/5", "from-amber-500/20 to-amber-500/5",
  "from-purple-500/20 to-purple-500/5",
];

export function VendorCard({ vendor, className }: { vendor: VendorCardData; className?: string }) {
  const minPrice = vendor.services[0]?.basePrice ?? 0;
  const gradIdx  = vendor.id.charCodeAt(0) % GRAD.length;

  return (
    <Link href={`/vendors/${vendor.id}`} className="group block">
      <Card className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5",
        className
      )}>
        {/* Cover */}
        <div className="relative h-44 overflow-hidden bg-muted">
          {vendor.portfolioImages.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vendor.portfolioImages[0]} alt={vendor.businessName}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className={cn("h-full w-full bg-linear-to-br flex items-center justify-center", GRAD[gradIdx])}>
              <span className="text-4xl font-bold opacity-20">{vendor.businessName[0]}</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-semibold text-gray-800">
              {VENDOR_CATEGORY_LABELS[vendor.category] ?? vendor.category}
            </span>
          </div>
          {vendor.isVerified && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                ✓ Verified
              </span>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors">
              {vendor.businessName}
            </h3>
            {vendor.avgRating > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold">{vendor.avgRating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({vendor.totalReviews})</span>
              </div>
            )}
          </div>

          {vendor.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{vendor.description}</p>
          )}

          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" />{vendor.city}, {vendor.state}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3 shrink-0" />Responds in {vendor.responseTime}h
            </span>
            {vendor.totalBookings > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3 shrink-0" />{vendor.totalBookings} events
              </span>
            )}
          </div>

          {minPrice > 0 && (
            <div className="pt-1 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Starting from</span>
              <span className="text-sm font-bold">{formatCurrency(minPrice)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}