
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export const KycWarningBanner = () => {
  return (
    <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
      <AlertCircle className="size-5 text-amber-600 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-amber-900">KYC verification pending</p>
        <p className="text-xs text-amber-700 mt-0.5">
          Your profile is not visible to customers until KYC is approved. Submit your GST certificate, PAN card, and business registration.
        </p>
        <Button variant="outline" size="sm" className="mt-2" asChild>
          <Link href="/vendor/kyc">Complete KYC now</Link>
        </Button>
      </div>
    </div>
  );
}