// src/components/vendors/booking-status-stepper.tsx

import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { status: "INQUIRY",     label: "Inquiry Sent",   desc: "Waiting for vendor" },
  { status: "QUOTE_SENT",  label: "Quote Received", desc: "Review the quote"   },
  { status: "NEGOTIATION", label: "Negotiation",    desc: "Finalising terms"   },
  { status: "CONFIRMED",   label: "Confirmed",      desc: "Booking locked in"  },
  { status: "IN_PROGRESS", label: "Event Day",      desc: "Event is live"      },
  { status: "COMPLETED",   label: "Completed",      desc: "All done!"          },
];

const ORDER: Record<string, number> = {
  INQUIRY:0, QUOTE_SENT:1, NEGOTIATION:2, CONFIRMED:3, IN_PROGRESS:4, COMPLETED:5,
};

export function BookingStatusStepper({ status }: { status: string }) {
  const idx = ORDER[status] ?? 0;

  if (status === "CANCELLED") return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4">
      <p className="text-sm font-semibold text-destructive">Booking Cancelled</p>
    </div>
  );
  if (status === "DISPUTED") return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-4">
      <p className="text-sm font-semibold text-amber-900">Under Dispute</p>
    </div>
  );

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start">
        {STEPS.map((step, i) => {
          const done   = i < idx;
          const active = i === idx;
          const last   = i === STEPS.length - 1;
          return (
            <div key={step.status} className={cn("flex flex-col items-center", last ? "flex-none" : "flex-1")}>
              <div className="flex items-center w-full">
                <div className={cn(
                  "size-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all",
                  done   ? "border-green-600 bg-green-600 text-white"
                  : active ? "border-primary bg-primary text-primary-foreground"
                  :         "border-border bg-background text-muted-foreground"
                )}>
                  {done ? <CheckCircle2 className="size-4" /> : <Circle className={cn("size-3", active ? "fill-primary-foreground" : "fill-transparent")} />}
                </div>
                {!last && <div className={cn("flex-1 h-0.5 transition-colors", i < idx ? "bg-green-600" : "bg-border")} />}
              </div>
              <div className="mt-2 text-center px-1 max-w-20">
                <p className={cn("text-[10px] font-semibold leading-tight",
                  active ? "text-foreground" : done ? "text-muted-foreground" : "text-muted-foreground/60")}>
                  {step.label}
                </p>
                {active && <p className="text-[9px] text-muted-foreground mt-0.5 hidden sm:block">{step.desc}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}