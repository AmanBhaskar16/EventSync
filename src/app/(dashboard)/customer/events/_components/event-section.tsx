// app/(dashboard)/customer/events/_components/event-section.tsx
import { EventCard } from "./event-card";
import type { EventListItem } from "../_queries";

export function EventSection({
  label,
  events,
  dimmed = false,
}: {
  label: string;
  events: EventListItem[];
  dimmed?: boolean;
}) {
  if (events.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {label} <span className="text-primary ml-1">{events.length}</span>
      </h2>
      <div className={`space-y-3 ${dimmed ? "opacity-70" : ""}`}>
        {events.map((e) => <EventCard key={e.id} event={e} />)}
      </div>
    </section>
  );
}