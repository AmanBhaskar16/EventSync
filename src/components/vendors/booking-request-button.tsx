
// Shows customer existing events, auto-fills details, sends inquiry

"use client";

import { useState } from "react";
import { useRouter }    from "next/navigation";
import { useSession }   from "next-auth/react";
import { toast }        from "sonner";
import { CalendarDays, Loader2, Plus, Users, FileText } from "lucide-react";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { formatDate } from "@/lib/utils";

type EventOption = {
  id: string; title: string; eventDate: string;
  type: string; guestCount: number | null;
};

export function BookingRequestButton({
  vendorId, vendorName,
}: {
  vendorId: string; vendorName: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();

  const [step,       setStep]       = useState<"idle"|"pick"|"form">("idle");
  const [loading,    setLoading]    = useState(false);
  const [evLoading,  setEvLoading]  = useState(false);
  const [events,     setEvents]     = useState<EventOption[]>([]);
  const [selectedEv, setSelectedEv] = useState<EventOption | null>(null);
  const [form, setForm] = useState({ guestCount: "", requirements: "" });

  async function loadEvents() {
    setEvLoading(true);
    try {
      // ?upcoming=true — only fetch events from today onwards
      const res  = await fetch("/api/events?upcoming=true");
      const data = await res.json() as { success: boolean; data?: EventOption[] };
      if (data.success && data.data) setEvents(data.data);
    } catch { /* silent */ }
    finally   { setEvLoading(false); }
  }

  function handleClick() {
    if (!session?.user) {
      router.push(`/login?callbackUrl=/vendors/${vendorId}`);
      return;
    }
    if (session.user.role !== "CUSTOMER") {
      toast.error("Only customers can request bookings.");
      return;
    }
    loadEvents();
    setStep("pick");
  }

  function selectEvent(ev: EventOption) {
    setSelectedEv(ev);
    setForm({
      guestCount:   ev.guestCount ? String(ev.guestCount) : "",
      requirements: "",
    });
    setStep("form");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEv) { toast.error("Please select an event."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          eventId:         selectedEv.id,
          eventDate:       selectedEv.eventDate,
          guestCount:      form.guestCount ? parseInt(form.guestCount) : (selectedEv.guestCount ?? undefined),
          specialRequests: form.requirements || undefined,
        }),
      });
      const data = await res.json() as {
        success: boolean; data?: { bookingId: string }; error?: string;
      };
      if (!res.ok || !data.success) {
        toast.error(data.error ?? "Failed to send inquiry.");
        return;
      }
      toast.success(`Inquiry sent to ${vendorName}!`);
      router.push(`/customer/bookings/${data.data!.bookingId}`);
    } catch { toast.error("Network error. Please try again."); }
    finally   { setLoading(false); }
  }

  // ── IDLE ──────────────────────────────────────────────────────────────────
  if (step === "idle") {
    return (
      <Button className="w-full" size="lg" onClick={handleClick}>
        <CalendarDays className="size-4" />
        {session?.user ? "Request booking" : "Sign in to book"}
      </Button>
    );
  }

  // ── PICK EVENT ────────────────────────────────────────────────────────────
  if (step === "pick") {
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold">Select your event:</p>

        {evLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-4 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              No upcoming events found. Create one first.
            </p>
            <Button size="sm" variant="outline" className="w-full"
              onClick={() => router.push("/customer/events/new")}>
              <Plus className="size-4" /> Create new event
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {events.map((ev) => (
              <button
                key={ev.id}
                onClick={() => selectEvent(ev)}
                className="w-full text-left rounded-lg border border-border p-3 hover:border-primary/50 hover:bg-primary/5 transition-all space-y-1"
              >
                <p className="text-sm font-semibold truncate">{ev.title}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3" />
                    {formatDate(ev.eventDate)}
                  </span>
                  {ev.guestCount && (
                    <span className="flex items-center gap-1">
                      <Users className="size-3" />
                      {ev.guestCount} guests
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full"
          onClick={() => setStep("idle")}>
          Cancel
        </Button>
      </div>
    );
  }

  // ── FORM ──────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {selectedEv && (
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Booking for
            </p>
            <button type="button" onClick={() => setStep("pick")}
              className="text-xs text-primary hover:underline">
              Change
            </button>
          </div>
          <p className="text-sm font-semibold">{selectedEv.title}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3" />{formatDate(selectedEv.eventDate)}
            </span>
            {selectedEv.guestCount && (
              <span className="flex items-center gap-1">
                <Users className="size-3" />{selectedEv.guestCount} guests
              </span>
            )}
          </div>
        </div>
      )}

      <FormField label="Guest count" htmlFor="gcount">
        <Input id="gcount" type="number" min={1}
          placeholder={selectedEv?.guestCount ? String(selectedEv.guestCount) : "e.g. 150"}
          className="h-9 text-sm"
          value={form.guestCount}
          onChange={(e) => setForm((f) => ({ ...f, guestCount: e.target.value }))} />
      </FormField>

      <FormField label="Special requirements" htmlFor="reqs">
        <textarea id="reqs" rows={2}
          placeholder="Any specific needs, theme, dietary requirements…"
          value={form.requirements}
          onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground resize-none" />
      </FormField>

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" className="flex-1"
          onClick={() => setStep("pick")} disabled={loading}>
          Back
        </Button>
        <Button type="submit" size="sm" className="flex-1" disabled={loading}>
          {loading
            ? <><Loader2 className="size-4 animate-spin" /> Sending…</>
            : <><FileText className="size-4" /> Send inquiry</>
          }
        </Button>
      </div>
    </form>
  );
}