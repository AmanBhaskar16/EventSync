"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
// import { Input }     from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const REASONS = [
  "Service not delivered as agreed",
  "Vendor did not show up",
  "Quality was significantly below standard",
  "Overcharged beyond agreed price",
  "Damaged property or equipment",
  "Unprofessional behavior",
  "Other",
];

export default function DisputePage() {
  const params = useParams();
  const router = useRouter();
  const id  = params.id as string;

  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if(!reason){ 
        toast.error("Please select a reason."); 
        return; 
    }
    if(!description.trim()){ 
        toast.error("Please describe the issue."); 
        return; 
    }
    setLoading(true);
    try {
      const res  = await fetch("/api/disputes", {
        method:  "POST",
        headers: { 
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
            bookingId: id, 
            reason, 
            description: description.trim() 
        }),
      });
        const data = await res.json() as { 
            success: boolean; 
            error?: string 
        };
        if(!data.success) { 
            toast.error(data.error ?? "Failed."); 
            return; 
        }
      toast.success("Dispute raised. Our team will review within 24 hours.");
      router.push(`/customer/bookings/${id}`);
    } catch { 
        toast.error("Network error.");
    }
    finally { 
        setLoading(false); 
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={`/customer/bookings/${id}`}><ArrowLeft className="size-4" /> Back</Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Raise a Dispute</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Our team will review and respond within 24–48 hours.
        </p>
      </div>

      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
        <AlertTriangle className="size-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold">Before raising a dispute</p>
          <p className="mt-1 text-xs leading-relaxed">
            We recommend messaging the vendor first to resolve the issue directly.
            Disputes are permanent and may affect the vendor&apos;s rating.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dispute Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Reason" htmlFor="reason" required>
              <select id="reason" value={reason} onChange={(e) => setReason(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Select a reason…</option>
                {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </FormField>

            <FormField label="Description" htmlFor="desc" required>
              <textarea id="desc" rows={5}
                placeholder="Describe what happened in detail — include dates, amounts, and any evidence you have…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground resize-none" />
            </FormField>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" size="lg" loading={loading}>
          <AlertTriangle className="size-4" /> Submit Dispute
        </Button>
      </form>
    </div>
  );
}