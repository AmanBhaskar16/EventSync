
"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { CheckCircle, CreditCard, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge }  from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const MILESTONE_LABELS: Record<string, string> = {
  BOOKING_CONFIRMATION: "Booking Confirmation",
  PRE_EVENT:            "Pre-Event Payment",
  POST_EVENT:           "Post-Event Settlement",
};
const MILESTONE_PCT: Record<string, number> = {
  BOOKING_CONFIRMATION: 30,
  PRE_EVENT:            40,
  POST_EVENT:           30,
};

type Payment = {
  id: string; milestone: string; amount: number;
  status: string; paidAt: string | null;
};

type Props = {
  bookingId:   string;
  agreedPrice: number;
  payments:    Payment[];
  onPaid:      () => void;
};

// Inner form rendered inside Stripe Elements
function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect:      "if_required",
    });
    if (error) {
      toast.error(error.message ?? "Payment failed.");
    } else {
      toast.success("Payment successful!");
      onSuccess();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" className="w-full" loading={loading} disabled={!stripe}>
        <CreditCard className="size-4" /> Pay now
      </Button>
    </form>
  );
}

export function PaymentMilestoneCard({ bookingId, agreedPrice, payments, onPaid }: Props) {
  const [activeMS,    setActiveMS]    = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount,      setAmount]      = useState(0);
  const [loading,     setLoading]     = useState(false);

  const milestones = ["BOOKING_CONFIRMATION", "PRE_EVENT", "POST_EVENT"];

  async function initPayment(milestone: string) {
    setLoading(true);
    try {
      const res  = await fetch("/api/payments/create-intent", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ bookingId, milestone }),
      });
      const data = await res.json() as { success: boolean; clientSecret?: string; amount?: number; error?: string };
      if (!data.success || !data.clientSecret) {
        toast.error(data.error ?? "Failed to initiate payment.");
        return;
      }
      setClientSecret(data.clientSecret);
      setAmount(data.amount ?? 0);
      setActiveMS(milestone);
    } catch { toast.error("Network error."); }
    finally   { setLoading(false); }
  }

  function getPayment(ms: string) {
    return payments.find((p) => p.milestone === ms) ?? null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="size-4 text-muted-foreground" /> Payment Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-3 flex justify-between text-sm">
          <span className="text-muted-foreground">Total agreed price</span>
          <span className="font-bold">{formatCurrency(agreedPrice)}</span>
        </div>

        {milestones.map((ms) => {
          const payment   = getPayment(ms);
          const msAmount  = Math.round(agreedPrice * MILESTONE_PCT[ms] / 100);
          const isPaid    = payment?.status === "PAID";
          const isPending = payment?.status === "PENDING" || payment?.status === "PROCESSING";

          return (
            <div key={ms} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{MILESTONE_LABELS[ms]}</p>
                  <p className="text-xs text-muted-foreground">
                    {MILESTONE_PCT[ms]}% — {formatCurrency(msAmount)}
                  </p>
                  {isPaid && payment?.paidAt && (
                    <p className="text-xs text-green-600">Paid on {formatDate(payment.paidAt)}</p>
                  )}
                </div>
                <div>
                  {isPaid ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle className="size-3" /> Paid
                    </Badge>
                  ) : isPending ? (
                    <Badge variant="warning" className="gap-1">
                      <Clock className="size-3" /> Processing
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => initPayment(ms)}
                      loading={loading && activeMS === ms}
                      disabled={loading}
                    >
                      Pay {formatCurrency(msAmount)}
                    </Button>
                  )}
                </div>
              </div>

              {activeMS === ms && clientSecret && (
                <div className="rounded-xl border border-border p-4 bg-card">
                  <p className="text-xs text-muted-foreground mb-3">
                    Paying {formatCurrency(amount)} securely via Stripe
                  </p>
                  <Elements
                    stripe={stripePromise}
                    options={{ clientSecret, appearance: { theme: "stripe" } }}
                  >
                    <CheckoutForm onSuccess={() => { setActiveMS(null); setClientSecret(null); onPaid(); }} />
                  </Elements>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}