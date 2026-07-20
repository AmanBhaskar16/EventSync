
import { MapPin, Clock, Calendar, BadgeCheck } from "lucide-react";
import { StarRating } from "@/components/shared/star-rating";
import { VENDOR_CATEGORY_LABELS } from "@/lib/utils";
import type { VendorProfile } from "../_queries";

export const VendorProfileHeader = ({ vendor }: { vendor: VendorProfile }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-5">
        <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary border border-primary/20 shrink-0">
          {vendor.businessName.charAt(0)}
        </div>
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{vendor.businessName}</h1>
            {vendor.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                <BadgeCheck className="size-3.5" /> Verified
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span className="text-sm font-medium rounded-full border border-border bg-muted/50 px-2.5 py-0.5">
              {VENDOR_CATEGORY_LABELS[vendor.category] ?? vendor.category}
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />{vendor.city}, {vendor.state}
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="size-3.5" />Responds in {vendor.responseTime}h
            </span>
          </div>
          <div className="flex flex-wrap gap-5">
            {vendor.avgRating > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={vendor.avgRating} size="md" />
                <span className="text-xs text-muted-foreground">({vendor.totalReviews} reviews)</span>
              </div>
            )}
            {vendor.totalBookings > 0 && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="size-4" />{vendor.totalBookings} events completed
              </span>
            )}
          </div>
        </div>
      </div>
      {vendor.description && (
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{vendor.description}</p>
      )}
    </div>
  );
}