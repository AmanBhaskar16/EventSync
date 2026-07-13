
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, XCircle, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, VENDOR_CATEGORY_LABELS } from "@/lib/utils";

type Vendor = {
  id: string; 
  businessName: string; 
  category: string;
  city: string; 
  state: string; 
  kycStatus: string;
  gstin: string | null; 
  pan: string | null; 
  createdAt: Date;
  user: { 
    name: string | null; 
    email: string; 
    phone: string | null 
  };
};

export function KYCReviewCard({ vendor }: { vendor: Vendor }) {
  const router  = useRouter();
  const [loading, setLoading] = useState<"APPROVE"|"REJECT"|null>(null);
  const [showReject, setShowReject] = useState(false);
  const [note, setNote] = useState("");

  async function handleAction(action: "APPROVE" | "REJECT") {
    if (action === "REJECT" && !showReject) { 
      setShowReject(true); 
      return; 
    }

    if (action === "REJECT" && !note.trim()) { 
      toast.error("Please provide a rejection reason."); 
      return; 
    }

    setLoading(action);
    try {
      const res  = await fetch(`/api/admin/kyc/${vendor.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action, note }),
      });

      const data = await res.json() as { 
        success: boolean; 
        error?: string 
      };

      if (!data.success) { 
        toast.error(data.error ?? "Failed."); 
        return; 
      }

      toast.success(action === "APPROVE" ? "Vendor approved!" : "Vendor rejected.");
      router.refresh();
    } catch { 
      toast.error("Network error."); 
    }
    finally { 
      setLoading(null); 
    }
  }

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
              {vendor.businessName.charAt(0)}
            </div>
            <div className="min-w-0 space-y-1">
              <p className="font-semibold">{vendor.businessName}</p>
              <p className="text-sm text-muted-foreground">
                {VENDOR_CATEGORY_LABELS[vendor.category] ?? vendor.category} · {vendor.city}, {vendor.state}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="size-3" />{vendor.user.email}</span>
                {vendor.user.phone && <span className="flex items-center gap-1"><Phone className="size-3" />{vendor.user.phone}</span>}
              </div>
            </div>
          </div>
          <Badge variant="warning" className="text-[10px] shrink-0">Pending</Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          {[
            { label: "Applied",  value: formatDate(vendor.createdAt)   },
            { label: "GSTIN", value: vendor.gstin ?? "Not provided" },
            { label: "PAN", value: vendor.pan ?? "Not provided" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-muted/50 p-2.5">
              <p className="text-muted-foreground">{label}</p>
              <p className="font-medium mt-0.5 truncate">{value}</p>
            </div>
          ))}
        </div>

        {showReject && (
          <div className="space-y-2">
            <textarea rows={2} placeholder="Reason for rejection (shown to vendor)…"
              value={note} onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
          </div>
        )}

        <div className="flex gap-3">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="sm"
            onClick={() => handleAction("APPROVE")}
            loading={loading === "APPROVE"}
            disabled={!!loading}
          >
            <CheckCircle className="size-4" /> Approve
          </Button>
          <Button
            variant="outline"
            className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
            size="sm"
            onClick={() => handleAction("REJECT")}
            loading={loading === "REJECT"}
            disabled={!!loading}
          >
            <XCircle className="size-4" /> {showReject ? "Confirm Reject" : "Reject"}
          </Button>
          {showReject && (
            <Button variant="ghost" size="sm" onClick={() => { setShowReject(false); setNote(""); }}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}