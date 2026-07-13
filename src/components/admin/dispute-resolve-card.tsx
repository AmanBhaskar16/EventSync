
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Button }    from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge }     from "@/components/ui/badge";
import { formatDate, formatCurrency, VENDOR_CATEGORY_LABELS } from "@/lib/utils";

type Dispute = {
  id: string; 
  reason: string; 
  description: string;
  status: string; 
  resolution: string | null; 
  createdAt: Date;
  booking: {
    id: string; 
    agreedPrice: number | null;
    vendor: { 
      businessName: string; 
      category: string 
    };
    event: {
      title: string; 
      eventDate: Date;
      customer: { 
        user: { 
          name: string | null; 
          email: string 
        } 
      };
    };
  };
};

const RESOLUTIONS = [
  { value: "RESOLVED_CUSTOMER", label: "Resolve in favour of Customer" },
  { value: "RESOLVED_VENDOR", label: "Resolve in favour of Vendor" },
  { value: "CLOSED", label: "Close without resolution" },
];

export const DisputeResolveCard = ({ dispute }: { dispute: Dispute }) => {
  const router = useRouter();
  const [status, setStatus] = useState("RESOLVED_CUSTOMER");
  const [resolution, setResolution] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function handleResolve() {
    if (!resolution.trim()) { 
      toast.error("Resolution note is required."); 
      return; 
    }
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/disputes/${dispute.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status, resolution }),
      });


      const data = await res.json() as { 
        success: boolean; 
        error?: string 
      };

      if (!data.success) { 
        toast.error(data.error ?? "Failed."); 
        return; 
      }
      toast.success("Dispute resolved.");
      router.refresh();
    } catch { 
      toast.error("Network error."); 
    }
    finally   { 
      setLoading(false); 
    }
  }

  return (
    <Card className="border-l-4 border-l-red-500">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm">{dispute.booking.vendor.businessName}</p>
              <Badge variant="destructive" className="text-[10px]">Open</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {VENDOR_CATEGORY_LABELS[dispute.booking.vendor.category]} ·{" "}
              {dispute.booking.event.title} · {formatDate(dispute.booking.event.eventDate)}
            </p>
            <p className="text-xs text-muted-foreground">
              Customer: {dispute.booking.event.customer.user.name ?? "—"} ({dispute.booking.event.customer.user.email})
            </p>
            {dispute.booking.agreedPrice && (
              <p className="text-xs font-medium">Booking value: {formatCurrency(dispute.booking.agreedPrice)}</p>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0">{formatDate(dispute.createdAt)}</span>
        </div>

        <div className="rounded-lg bg-red-50 border border-red-200 p-3 space-y-1">
          <p className="text-xs font-semibold text-red-800">{dispute.reason}</p>
          <p className="text-xs text-red-700 leading-relaxed">{dispute.description}</p>
        </div>

        {!expanded ? (
          <Button variant="outline" size="sm" className="w-full" onClick={() => setExpanded(true)}>
            <AlertCircle className="size-4" /> Resolve this dispute
          </Button>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Decision</p>
              <div className="space-y-2">
                {RESOLUTIONS.map((r) => (
                  <label key={r.value} className="flex items-center gap-2.5 cursor-pointer">
                    <input type="radio" name={`res-${dispute.id}`} value={r.value}
                      checked={status === r.value}
                      onChange={() => setStatus(r.value)}
                      className="size-3.5" />
                    <span className="text-sm">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <textarea rows={3} placeholder="Resolution note (shown to both parties)…"
              value={resolution} onChange={(e) => setResolution(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
            <div className="flex gap-3">
              <Button className="flex-1 bg-green-600 hover:bg-green-700" size="sm" onClick={handleResolve} loading={loading}>
                <CheckCircle className="size-4" /> Submit Resolution
              </Button>
              <Button variant="outline" size="sm" onClick={() => setExpanded(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}