
// Vendor uses this to create and send a quote

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Send } from "lucide-react";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type LineItem = { 
  description: string; 
  quantity: number; 
  unitPrice: number; 
  total: number 
};

const EMPTY_LINE: LineItem = { 
  description: "", 
  quantity: 1, 
  unitPrice: 0, 
  total: 0 
};

export function QuoteBuilder({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [lines,     setLines]     = useState<LineItem[]>([{ ...EMPTY_LINE }]);
  const [gstRate,   setGstRate]   = useState(18);
  const [validDays, setValidDays] = useState(7);
  const [notes,     setNotes]     = useState("");
  const [terms,     setTerms]     = useState("50% advance required on confirmation.");
  const [loading,   setLoading]   = useState(false);

  function updateLine(idx: number, field: keyof LineItem, value: string | number) {
    setLines((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        next[idx].total = Number(next[idx].quantity) * Number(next[idx].unitPrice);
      }
      return next;
    });
  }

  function addLine() { 
    setLines((p) => [...p, { ...EMPTY_LINE }]); 
  }
  function removeLine(idx: number) { 
    setLines((p) => p.filter((_, i) => i !== idx)); 
  }

  const subtotal    = lines.reduce((s, l) => s + l.total, 0);
  const gstAmount   = (subtotal * gstRate) / 100;
  const totalAmount = subtotal + gstAmount;

  async function handleSend() {
    if (lines.some((l) => !l.description.trim() || l.unitPrice <= 0)) {
      toast.error("Fill in all line items with valid prices.");
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch(`/api/bookings/${bookingId}/quote`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ 
          lineItems: lines, 
          gstRate, 
          validDays, 
          notes, 
          terms 
        }),
      });
      const data = await res.json() as { 
        success: boolean;
         error?: string 
        };
      if (!res.ok || !data.success) { 
        toast.error(data.error ?? "Failed to send quote."); 
        return; 
      }
      toast.success("Quote sent to customer!");
      router.refresh();
    } catch { 
      toast.error("Network error."); 
    }
    finally { 
      setLoading(false); 
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Send a Quote</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* Line items */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Line Items</p>

          {/* Header row */}
          <div className="grid grid-cols-[1fr_80px_100px_100px_32px] gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground px-1">
            <span>Description</span><span className="text-center">Qty</span>
            <span className="text-right">Unit Price</span><span className="text-right">Total</span><span />
          </div>

          {lines.map((line, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_80px_100px_100px_32px] gap-2 items-center">
              <Input
                placeholder="e.g. Catering for 100 guests"
                value={line.description}
                onChange={(e) => updateLine(idx, "description", e.target.value)}
                className="h-8 text-xs"
              />
              <Input
                type="number" min={1}
                value={line.quantity}
                onChange={(e) => updateLine(idx, "quantity", parseInt(e.target.value) || 1)}
                className="h-8 text-xs text-center"
              />
              <Input
                type="number" min={0} placeholder="0"
                value={line.unitPrice || ""}
                onChange={(e) => updateLine(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                className="h-8 text-xs text-right"
              />
              <div className="h-8 flex items-center justify-end text-xs font-semibold">
                {formatCurrency(line.total)}
              </div>
              {lines.length > 1 ? (
                <button onClick={() => removeLine(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="size-3.5" />
                </button>
              ) : <div />}
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={addLine} className="w-full">
            <Plus className="size-3.5" /> Add line item
          </Button>
        </div>

        {/* GST + validity */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="GST Rate (%)" htmlFor="gst">
            <Input id="gst" type="number" min={0} max={28} value={gstRate}
              onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
              className="h-8 text-xs" />
          </FormField>
          <FormField label="Valid for (days)" htmlFor="valid">
            <Input id="valid" type="number" min={1} max={30} value={validDays}
              onChange={(e) => setValidDays(parseInt(e.target.value) || 7)}
              className="h-8 text-xs" />
          </FormField>
        </div>

        {/* Totals */}
        <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-2">
          {[
            { label: "Subtotal",    value: formatCurrency(subtotal)    },
            { label: `GST (${gstRate}%)`, value: formatCurrency(gstAmount) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm text-muted-foreground">
              <span>{label}</span><span>{value}</span>
            </div>
          ))}
          <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
            <span>Total</span><span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Notes + Terms */}
        <FormField label="Notes for customer" htmlFor="notes">
          <textarea id="notes" rows={2} placeholder="Any special notes…"
            value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground resize-none" />
        </FormField>

        <FormField label="Terms & Conditions" htmlFor="terms">
          <textarea id="terms" rows={2}
            value={terms} onChange={(e) => setTerms(e.target.value)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground resize-none" />
        </FormField>

        <Button className="w-full" onClick={handleSend} loading={loading}>
          <Send className="size-4" /> Send Quote to Customer
        </Button>
      </CardContent>
    </Card>
  );
}