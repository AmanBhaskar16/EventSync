
// Customer reviews a quote and accepts / rejects / counter-offers

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { Button }    from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge }     from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

type LineItem = { 
  description: string; 
  quantity: number; 
  unitPrice: number; 
  total: number 
};
type QuoteData = {
  id: string; 
  version: number; 
  status: string;
  lineItems: LineItem[]; 
  subtotal: number; 
  gstRate: number;
  gstAmount: number; 
  totalAmount: number; 
  validUntil: string;
  notes: string | null; 
  terms: string | null;
};

export function QuoteReview({ bookingId, quote }: { bookingId: string; quote: QuoteData }) {
  const router = useRouter();
  const [loading,setLoading] = useState<string | null>(null);
  const [showCounter, setShowCounter] = useState(false);
  const [counterMessage, setCounterMessage] = useState("");

  async function respond(action: "ACCEPT" | "REJECT" | "COUNTER") {
    setLoading(action);
    try {
      const res  = await fetch(`/api/bookings/${bookingId}/quote`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action, message: counterMessage }),
      });
      const data = await res.json() as { 
        success: boolean; 
        error?: string; 
        message?: string 
      };
      if (!res.ok || !data.success) { 
        toast.error(data.error ?? "Failed."); 
        return; 
      }
      toast.success(data.message ?? "Done!");
      router.refresh();
    } catch { 
      toast.error("Network error."); 
    }
    finally { 
      setLoading(null); 
    }
  }

  const isExpired  = new Date(quote.validUntil) < new Date();
  const canRespond = quote.status === "SENT" && !isExpired;

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Quote v{quote.version}</CardTitle>
        <div className="flex items-center gap-2">
          {isExpired && <Badge variant="destructive" className="text-[10px]">Expired</Badge>}
          <Badge
            variant={
              quote.status === "ACCEPTED" ? "success" :
              quote.status === "REJECTED" ? "destructive" :
              quote.status === "COUNTER_OFFERED" ? "warning" : "secondary"
            }
            className="text-[10px]"
          >
            {quote.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Line items */}
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_60px_100px_100px] gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Description</span><span className="text-center">Qty</span>
            <span className="text-right">Unit Price</span><span className="text-right">Total</span>
          </div>
          {quote.lineItems.map((item, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_60px_100px_100px] gap-2 text-sm">
              <span className="text-foreground">{item.description}</span>
              <span className="text-center text-muted-foreground">{item.quantity}</span>
              <span className="text-right text-muted-foreground">{formatCurrency(item.unitPrice)}</span>
              <span className="text-right font-medium">{formatCurrency(item.total)}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-2">
          {[
            { label: "Subtotal",          value: formatCurrency(quote.subtotal)    },
            { label: `GST (${quote.gstRate}%)`, value: formatCurrency(quote.gstAmount) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm text-muted-foreground">
              <span>{label}</span><span>{value}</span>
            </div>
          ))}
          <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
            <span>Total</span><span className="text-primary">{formatCurrency(quote.totalAmount)}</span>
          </div>
          <p className="text-[10px] text-muted-foreground pt-1">
            Valid until {formatDate(quote.validUntil)}
          </p>
        </div>

        {/* Notes / Terms */}
        {quote.notes && (
          <div className="text-sm space-y-1">
            <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">Notes</p>
            <p className="text-muted-foreground leading-relaxed">{quote.notes}</p>
          </div>
        )}
        {quote.terms && (
          <div className="text-sm space-y-1">
            <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">Terms</p>
            <p className="text-muted-foreground leading-relaxed">{quote.terms}</p>
          </div>
        )}

        {/* Actions */}
        {canRespond && (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => respond("ACCEPT")}
                loading={loading === "ACCEPT"}
              >
                <CheckCircle className="size-4" /> Accept Quote
              </Button>
              <Button
                variant="outline"
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => respond("REJECT")}
                loading={loading === "REJECT"}
              >
                <XCircle className="size-4" /> Reject
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCounter((v) => !v)}
            >
              <MessageSquare className="size-4" /> Counter-offer
            </Button>
            {showCounter && (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  placeholder="Explain your counter-offer (e.g. I can do ₹45,000 if you include setup)"
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground resize-none"
                />
                <Button
                  className="w-full"
                  onClick={() => respond("COUNTER")}
                  loading={loading === "COUNTER"}
                  disabled={!counterMessage.trim()}
                >
                  Send Counter-offer
                </Button>
              </div>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}