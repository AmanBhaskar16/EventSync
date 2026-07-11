
// Vendor action buttons — Mark In Progress, Mark Completed, Cancel

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, PlayCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  bookingId: string;
  status:    string;
};

export function BookingActionButtons({ bookingId, status }: Props) {
  const router  = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(newStatus: string, label: string) {
    setLoading(newStatus);
    try {
      const res  = await fetch(`/api/bookings/${bookingId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: newStatus }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (!data.success) { toast.error(data.error ?? "Failed."); return; }
      toast.success(`Booking marked as ${label}!`);
      router.refresh();
    } catch { toast.error("Network error."); }
    finally   { setLoading(null); }
  }

  return (
    <div className="space-y-2">
      {status === "CONFIRMED" && (
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="sm"
          onClick={() => updateStatus("IN_PROGRESS", "In Progress")}
          disabled={!!loading}
        >
          {loading === "IN_PROGRESS"
            ? <span className="animate-pulse">Updating…</span>
            : <><PlayCircle className="size-4" /> Mark as In Progress</>
          }
        </Button>
      )}
      {status === "IN_PROGRESS" && (
        <Button
          className="w-full bg-green-600 hover:bg-green-700"
          size="sm"
          onClick={() => updateStatus("COMPLETED", "Completed")}
          disabled={!!loading}
        >
          {loading === "COMPLETED"
            ? <span className="animate-pulse">Updating…</span>
            : <><CheckCircle className="size-4" /> Mark as Completed</>
          }
        </Button>
      )}
      {!["COMPLETED","CANCELLED","DISPUTED"].includes(status) && (
        <Button
          variant="outline"
          size="sm"
          className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => updateStatus("CANCELLED", "Cancelled")}
          disabled={!!loading}
        >
          {loading === "CANCELLED"
            ? <span className="animate-pulse">Updating…</span>
            : <><XCircle className="size-4" /> Cancel booking</>
          }
        </Button>
      )}
    </div>
  );
}