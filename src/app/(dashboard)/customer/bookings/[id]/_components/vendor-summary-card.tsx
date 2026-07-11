
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/shared/star-rating";
import { VENDOR_CATEGORY_LABELS } from "@/lib/utils";
import type { CustomerBookingDetail } from "../_queries";

export function VendorSummaryCard({ vendor }: { vendor: CustomerBookingDetail["vendor"] }) {
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Vendor</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
            {vendor.businessName.charAt(0)}
          </div>
          <div className="min-w-0 space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold">{vendor.businessName}</p>
              {vendor.isVerified && (
                <span className="text-[11px] font-semibold text-green-600 flex items-center gap-1">
                  <CheckCircle className="size-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {VENDOR_CATEGORY_LABELS[vendor.category] ?? vendor.category} &middot; {vendor.city}, {vendor.state}
            </p>
            {vendor.avgRating > 0 && <StarRating rating={vendor.avgRating} size="sm" />}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/vendors/${vendor.id}`}>View profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}