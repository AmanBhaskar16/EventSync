
import { Clock, AlertCircle } from "lucide-react";

export const InquiryPendingBanner = ({ vendorName, responseTime }: { vendorName: string; responseTime: number }) => {
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
      <Clock className="size-5 text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold">Inquiry sent — awaiting vendor response</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {vendorName} typically responds within {responseTime} hours.
        </p>
      </div>
    </div>
  );
}

export const DisputeBanner = ({ reason, status }: { reason: string; status: string }) => {
  return (
    <div className="rounded-xl border border-red-300 bg-red-50 p-4 flex items-start gap-3">
      <AlertCircle className="size-5 text-red-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-red-900">Dispute raised — {status}</p>
        <p className="text-xs text-red-700 mt-0.5">{reason}</p>
      </div>
    </div>
  );
}