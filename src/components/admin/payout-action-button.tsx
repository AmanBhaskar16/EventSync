
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Banknote, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type Props = {
  bookingId:      string;
  vendorName:     string;
  amount:         number;
  hasBankDetails: boolean;
};

export function PayoutActionButton({ bookingId, vendorName, amount, hasBankDetails }: Props) {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);

  async function markPaid() {
    if (!confirm(`Mark payout of ${formatCurrency(amount)} to ${vendorName} as completed?`)) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/payouts/${bookingId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ vendorPayout: amount }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (!data.success) { toast.error(data.error ?? "Failed."); return; }
      toast.success(`Payout of ${formatCurrency(amount)} marked as completed!`);
      router.refresh();
    } catch { toast.error("Network error."); }
    finally   { setLoading(false); }
  }

  return (
    <Button
      className="w-full bg-green-600 hover:bg-green-700"
      size="sm"
      onClick={markPaid}
      disabled={loading || !hasBankDetails}
    >
      {loading
        ? <><Loader2 className="size-4 animate-spin" /> Processing…</>
        : <><Banknote className="size-4" /> Mark Payout as Completed — {formatCurrency(amount)}</>
      }
    </Button>
  );
}