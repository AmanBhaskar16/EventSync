
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ── Constants (outside component — not recreated on every render) ──

const EVENT_TYPES = [
  { value: "WEDDING", label: "💍 Wedding" },
  { value: "BIRTHDAY", label: "🎂 Birthday" },
  { value: "BACHELORETTE", label: "🥂 Bachelorette" },
  { value: "BACHELOR", label: "🎉 Bachelor Party" },
  { value: "ANNIVERSARY", label: "💑 Anniversary" },
  { value: "CORPORATE", label: "💼 Corporate" },
  { value: "KITTY_PARTY", label: "🍵 Kitty Party" },
  { value: "REUNION", label: "🤝 Reunion" },
  { value: "BABY_SHOWER", label: "🍼 Baby Shower" },
  { value: "ENGAGEMENT", label: "💍 Engagement" },
  { value: "COCKTAIL_PARTY", label: "🍸 Cocktail Party" },
  { value: "OTHER", label: "✨ Other" },
];

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

const TODAY = new Date().toISOString().split("T")[0];

interface EventForm {
  title: string; type: string; eventDate: string; city: string;
  state: string; venue: string; guestCount: string; budget: string; description: string;
}

const INITIAL_FORM: EventForm = {
  title: "", type: "", eventDate: "", city: "",
  state: "", venue: "", guestCount: "", budget: "", description: "",
};

function validateEventForm(form: EventForm) {
  const errors: Record<string, string> = {};
  if (!form.title.trim()) errors.title = "Event title is required.";
  if (!form.type) errors.type = "Please select an event type.";
  if (!form.eventDate) errors.eventDate = "Event date is required.";
  if (form.eventDate && new Date(form.eventDate) < new Date()) {
    errors.eventDate = "Event date must be in the future.";
  }
  return errors;
}

// ── Component ──

const NewEventPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<EventForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof EventForm>(k: K, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateEventForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const res  = await fetch("/api/events", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:       form.title.trim(),
          type:        form.type,
          eventDate:   form.eventDate,
          city:        form.city.trim() || undefined,
          state:       form.state || undefined,
          venue:       form.venue.trim() || undefined,
          guestCount:  form.guestCount ? Number(form.guestCount) : undefined,
          budget:      form.budget ? Number(form.budget) : undefined,
          description: form.description.trim() || undefined,
        }),
      });
      const data = await res.json() as { success: boolean; data?: { id: string }; error?: string };
      if (!data.success) { toast.error(data.error ?? "Failed to create event."); return; }
      toast.success("Event created!");
      router.push(`/customer/events/${data.data!.id}`);
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/customer/events"><ArrowLeft className="size-4" /> My Events</Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create New Event</h1>
        <p className="text-sm text-muted-foreground mt-1">Fill in your event details to start booking vendors.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Basic Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Event title" htmlFor="title" required error={errors.title}>
              <Input id="title" placeholder="e.g. Priya & Arjun's Wedding"
                value={form.title} onChange={(e) => set("title", e.target.value)} error={!!errors.title} />
            </FormField>

            <FormField label="Event type" htmlFor="type" required error={errors.type}>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {EVENT_TYPES.map(({ value, label }) => (
                  <button key={value} type="button" onClick={() => set("type", value)}
                    className={`rounded-lg border-2 p-2.5 text-xs font-medium text-center transition-all ${
                      form.type === value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/40"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Event date" htmlFor="date" required error={errors.eventDate}>
              <Input id="date" type="date" min={TODAY}
                value={form.eventDate} onChange={(e) => set("eventDate", e.target.value)} error={!!errors.eventDate} />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Location & Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="City" htmlFor="city">
                <Input id="city" placeholder="e.g. Mumbai"
                  value={form.city} onChange={(e) => set("city", e.target.value)} />
              </FormField>
              <FormField label="State" htmlFor="state">
                <select id="state" value={form.state} onChange={(e) => set("state", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
            </div>

            <FormField label="Venue name" htmlFor="venue">
              <Input id="venue" placeholder="e.g. The Grand Ballroom, Taj Hotel"
                value={form.venue} onChange={(e) => set("venue", e.target.value)} />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Guest count" htmlFor="guests">
                <Input id="guests" type="number" min={1} placeholder="e.g. 200"
                  value={form.guestCount} onChange={(e) => set("guestCount", e.target.value)} />
              </FormField>
              <FormField label="Budget (₹)" htmlFor="budget">
                <Input id="budget" type="number" min={0} placeholder="e.g. 500000"
                  value={form.budget} onChange={(e) => set("budget", e.target.value)} />
              </FormField>
            </div>

            <FormField label="Description / notes" htmlFor="desc">
              <textarea id="desc" rows={3}
                placeholder="Any special requirements, theme, or notes for vendors…"
                value={form.description} onChange={(e) => set("description", e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground resize-none" />
            </FormField>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          <CalendarDays className="size-4" /> Create Event
        </Button>
      </form>
    </div>
  );
}

export default NewEventPage;