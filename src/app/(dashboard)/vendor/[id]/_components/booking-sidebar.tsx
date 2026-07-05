
import { CheckCircle, Star, Clock, Banknote, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingRequestButton } from "@/components/vendors/booking-request-button";
import { formatCurrency } from "@/lib/utils";
import type { VendorProfile } from "../_queries";

const TRUST_SIGNALS = [
  { icon: CheckCircle, text: "KYC verified business"     },
  { icon: Banknote,    text: "Secure milestone payments" },
  { icon: Star,        text: "Dispute protection"        },
] as const;

export const BookingSidebar = ({ vendor, minPrice }: { vendor: VendorProfile; minPrice: number }) => {
  return (
    <div className="lg:sticky lg:top-28 space-y-4">
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Book this vendor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {minPrice > 0 && (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{formatCurrency(minPrice)}</span>
              <span className="text-sm text-muted-foreground">/ {vendor.services[0]?.unit}</span>
            </div>
          )}
          <div className="space-y-2 text-sm">
            {TRUST_SIGNALS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-muted-foreground">
                <Icon className="size-4 shrink-0 text-green-600" />
                <span>{text}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4 shrink-0 text-green-600" />
              <span>Responds within {vendor.responseTime} hours</span>
            </div>
          </div>
          <BookingRequestButton vendorId={vendor.id} vendorName={vendor.businessName} />
          <p className="text-[11px] text-muted-foreground text-center">No payment required to send an inquiry</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="size-10 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Phone className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold">Questions?</p>
            <p className="text-xs text-muted-foreground">Send an inquiry and chat directly with the vendor.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <p className="text-xs font-semibold">Service area</p>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <MapPin className="size-3.5 mt-0.5 shrink-0" />
            <span>{vendor.city}, {vendor.state} — within {vendor.serviceRadius} km</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
