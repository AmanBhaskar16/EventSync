
"use client";

import { useState, useEffect, useCallback } from "react";
import { loadStripe }    from "@stripe/stripe-js";
import {
  Elements, PaymentElement, useStripe, useElements,
} from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { Loader2, CheckCircle, CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const MILESTONE_LABELS: Record<string, string> = {
  BOOKING_CONFIRMATION: "Booking Confirmation",
  PRE_EVENT: "Pre-Event Payment",
  POST_EVENT: "Post-Event Settlement",
};
const MILESTONE_PCT: Record<string, number> = {
  BOOKING_CONFIRMATION: 30,
  PRE_EVENT: 40,
  POST_EVENT: 30,
};
const MILESTONES = ["BOOKING_CONFIRMATION", "PRE_EVENT", "POST_EVENT"];

type Payment = {
  id: string; milestone: string; amount: number;
  status: string; paidAt: string | null;
};

type CheckoutFormProps = {
  bookingId: string;
  milestone: string;
  onSuccess: () => void;
  onFail: () => void;
};

function CheckoutForm({ bookingId, milestone, onSuccess, onFail }: CheckoutFormProps) {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message ?? "Payment failed.");
      setLoading(false);
      onFail();
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      // Confirm with our backend — mark as PAID in DB
      try {
        const res  = await fetch("/api/payments/confirm", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            paymentIntentId: paymentIntent.id,
            bookingId,
            milestone,
          }),
        });
        const data = await res.json() as { success: boolean; error?: string };
        if (!data.success) {
          toast.error(data.error ?? "Failed to confirm payment.");
          setLoading(false);
          onFail();
          return;
        }
        toast.success("Payment successful! ✓");
        onSuccess();
      } catch {
        toast.error("Network error confirming payment.");
        setLoading(false);
        onFail();
      }
    } else {
      toast.error("Payment incomplete. Please try again.");
      setLoading(false);
      onFail();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-3">
      <PaymentElement />
      <Button type="submit" className="w-full" disabled={!stripe || loading}>
        {loading
          ? <><Loader2 className="size-4 animate-spin" /> Confirming payment…</>
          : <><CreditCard className="size-4" /> Confirm payment</>
        }
      </Button>
    </form>
  );
}

export function PaymentMilestoneCard({
  bookingId,
  agreedPrice,
  eventDate,
}: {
  bookingId:   string;
  agreedPrice: number;
  eventDate:   string;
}) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeMS, setActiveMS] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingMS, setLoadingMS] = useState<string | null>(null);

  const now = new Date();
  const evDate = eventDate ? new Date(eventDate) : new Date();
  const validEv  = !isNaN(evDate.getTime());
  const daysToEv = validEv ? Math.ceil((evDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 999;

  function isUnlocked(ms: string): boolean {
    if (ms === "BOOKING_CONFIRMATION") return true;
    if (!validEv) return true;
    if (ms === "PRE_EVENT")  return daysToEv <= 7;
    if (ms === "POST_EVENT") return now >= evDate;
    return false;
  }

  function lockReason(ms: string): string {
    if (ms === "PRE_EVENT")  return `Unlocks ${Math.max(0, daysToEv - 7)} day(s) before event`;
    if (ms === "POST_EVENT") {
      try { return `Unlocks after ${formatDate(evDate)}`; }
      catch { return "Unlocks after event date"; }
    }
    return "";
  }

  const fetchPayments = useCallback(async () => {
    try {
      const res  = await fetch(`/api/payments?bookingId=${bookingId}`);
      const data = await res.json() as { success: boolean; data?: Payment[] };
      if (data.success && data.data) setPayments(data.data);
    } catch { /* silent */ }
    finally { setFetching(false); }
  }, [bookingId]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  function getPayment(ms: string) {
    return payments.find((p) => p.milestone === ms) ?? null;
  }

  function canPay(ms: string): boolean {
    if (!isUnlocked(ms)) return false;
    const idx = MILESTONES.indexOf(ms);
    for (let i = 0; i < idx; i++) {
      const prev = getPayment(MILESTONES[i]);
      if (!prev || prev.status !== "PAID") return false;
    }
    const curr = getPayment(ms);
    return !curr || curr.status === "PENDING" || curr.status === "PROCESSING";
  }

  async function resetProcessing(milestone: string) {
    try {
      await fetch("/api/payments/reset", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ bookingId, milestone }),
      });
    } catch { /* silent */ }
  }

  async function initPayment(milestone: string) {
    if (activeMS === milestone) {
      setActiveMS(null); setClientSecret(null); return;
    }
    setLoadingMS(milestone);
    try {
      const res  = await fetch("/api/payments/create-intent", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ bookingId, milestone }),
      });
      const data = await res.json() as {
        success: boolean; clientSecret?: string; error?: string;
      };
      if (!data.success || !data.clientSecret) {
        toast.error(data.error ?? "Failed to initiate payment."); return;
      }
      setClientSecret(data.clientSecret);
      setActiveMS(milestone);
    } catch { toast.error("Network error."); }
    finally { setLoadingMS(null); }
  }

  async function onPaymentSuccess() {
    setActiveMS(null);
    setClientSecret(null);
    setFetching(true);
    await fetchPayments(); // re-fetch → UI updates to show PAID
  }

  async function onPaymentFail(milestone: string) {
    setActiveMS(null);
    setClientSecret(null);
    await resetProcessing(milestone);
    await fetchPayments();
  }

  if (fetching) return (
    <Card>
      <CardContent className="p-6 flex items-center justify-center">
        <Loader2 className="size-5 animate-spin text-primary" />
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="size-4 text-muted-foreground" /> Payment Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg bg-muted/50 p-3 flex justify-between text-sm">
          <span className="text-muted-foreground">Total agreed price</span>
          <span className="font-bold">{formatCurrency(agreedPrice)}</span>
        </div>

        {MILESTONES.map((ms) => {
          const payment  = getPayment(ms);
          const msAmount = Math.round(agreedPrice * MILESTONE_PCT[ms] / 100);
          const isPaid   = payment?.status === "PAID";
          const unlocked = isUnlocked(ms);
          const payable  = canPay(ms);
          const isActive = activeMS === ms;

          return (
            <div key={ms} className="space-y-3 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{MILESTONE_LABELS[ms]}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {MILESTONE_PCT[ms]}% — {formatCurrency(msAmount)}
                  </p>
                  {isPaid && payment?.paidAt && (
                    <p className="text-xs text-green-600 mt-0.5 font-medium">
                      ✓ Paid on {formatDate(payment.paidAt)}
                    </p>
                  )}
                  {!unlocked && (
                    <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                      <Lock className="size-3" /> {lockReason(ms)}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  {isPaid ? (
                    <Badge variant="success" className="gap-1 text-[10px]">
                      <CheckCircle className="size-3" /> Paid
                    </Badge>
                  ) : !unlocked ? (
                    <Badge variant="outline" className="gap-1 text-[10px] text-muted-foreground">
                      <Lock className="size-3" /> Locked
                    </Badge>
                  ) : payable ? (
                    <Button
                      size="sm"
                      variant={isActive ? "outline" : "default"}
                      onClick={() => initPayment(ms)}
                      disabled={!!loadingMS}
                    >
                      {loadingMS === ms
                        ? <Loader2 className="size-4 animate-spin" />
                        : isActive ? "Cancel"
                        : `Pay ${formatCurrency(msAmount)}`
                      }
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      Pay previous first
                    </Badge>
                  )}
                </div>
              </div>

              {isActive && clientSecret && (
                <div className="rounded-xl border border-border p-4 bg-card">
                  <p className="text-xs text-muted-foreground mb-1">
                    Paying {formatCurrency(msAmount)} securely via Stripe
                  </p>
                  <Elements
                    stripe={stripePromise}
                    options={{ clientSecret, appearance: { theme: "stripe" } }}
                  >
                    <CheckoutForm
                      bookingId={bookingId}
                      milestone={ms}
                      onSuccess={onPaymentSuccess}
                      onFail={() => onPaymentFail(ms)}
                    />
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