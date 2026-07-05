
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserCheck, AlertCircle } from "lucide-react";

export const AlertBanners = ({ pendingKYC, activeDisputes }: { pendingKYC: number; activeDisputes: number }) => {
  if (pendingKYC === 0 && activeDisputes === 0) return null;

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {pendingKYC > 0 && (
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
          <UserCheck className="size-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              {pendingKYC} vendor{pendingKYC !== 1 ? "s" : ""} awaiting KYC review
            </p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/admin/kyc">Review now</Link>
            </Button>
          </div>
        </div>
      )}
      {activeDisputes > 0 && (
        <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-900">
              {activeDisputes} open dispute{activeDisputes !== 1 ? "s" : ""} need resolution
            </p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/admin/disputes">Resolve</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}