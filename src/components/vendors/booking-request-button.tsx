// src/components/vendors/booking-request-button.tsx
// Inline inquiry form on vendor profile page

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CalendarDays, Loader2 } from "lucide-react";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export function BookingRequestButton({ vendorId, vendorName }: { vendorId: string; vendorName: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [expanded,  setExpanded]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [form, setForm] = useState({ eventDate: "", guestCount: "", requirements: "" });

  function handleClick() {
    if (!session?.user) { router.push(`/login?callbackUrl=/vendors/${vendorId}`); return; }
    if (session.user.role !== "CUSTOMER") { toast.error("Only customers can request bookings."); return; }
    setExpanded(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.eventDate) { toast.error("Please select an event date."); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/bookings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          eventDate:       form.eventDate,
          guestCount:      form.guestCount ? parseInt(form.guestCount) : undefined,
          specialRequests: form.requirements || undefined,
        }),
      });
      const data = await res.json() as { success: boolean; data?: { bookingId: string }; error?: string };
      if (!res.ok || !data.success) { toast.error(data.error ?? "Failed to send inquiry."); return; }
      toast.success(`Inquiry sent to ${vendorName}!`);
      router.push(`/customer/bookings/${data.data!.bookingId}`);
    } catch { toast.error("Network error. Please try again."); }
    finally   { setLoading(false); }
  }

  if (expanded) return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FormField label="Event date" htmlFor="edate" required>
        <Input id="edate" type="date" className="h-9 text-sm"
          min={new Date().toISOString().split("T")[0]}
          value={form.eventDate}
          onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))} />
      </FormField>
      <FormField label="Guest count" htmlFor="guests">
        <Input id="guests" type="number" placeholder="e.g. 150" min={1} className="h-9 text-sm"
          value={form.guestCount}
          onChange={(e) => setForm((f) => ({ ...f, guestCount: e.target.value }))} />
      </FormField>
      <FormField label="Special requirements" htmlFor="reqs">
        <textarea id="reqs" rows={3} placeholder="Any specific needs, themes, dietary requirements…"
          value={form.requirements}
          onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground resize-none" />
      </FormField>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setExpanded(false)} disabled={loading}>Cancel</Button>
        <Button type="submit" size="sm" className="flex-1" disabled={loading}>
          {loading ? <><Loader2 className="size-4 animate-spin" /> Sending…</> : "Send inquiry"}
        </Button>
      </div>
    </form>
  );

  return (
    <Button className="w-full" size="lg" onClick={handleClick}>
      <CalendarDays className="size-4" />
      {session?.user ? "Request booking" : "Sign in to book"}
    </Button>
  );
}