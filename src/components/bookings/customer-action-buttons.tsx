
// Customer action buttons — Cancel booking

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CustomerActionButtons({
  bookingId, status,
}: {
  bookingId: string; status: string;
}) {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);

  async function cancel() {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/bookings/${bookingId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: "CANCELLED", cancelReason: "Cancelled by customer" }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (!data.success) { toast.error(data.error ?? "Failed."); return; }
      toast.success("Booking cancelled.");
      router.refresh();
    } catch { toast.error("Network error."); }
    finally   { setLoading(false); }
  }

  if (["CANCELLED","COMPLETED","DISPUTED"].includes(status)) return null;

  return (
    <Button
      variant="outline" size="sm"
      className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
      onClick={cancel}
      disabled={loading}
    >
      <XCircle className="size-4" />
      {loading ? "Cancelling…" : "Cancel booking"}
    </Button>
  );
}