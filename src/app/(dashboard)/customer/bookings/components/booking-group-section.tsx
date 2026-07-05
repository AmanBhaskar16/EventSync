
import { BookingListItem } from "./booking-list-item";
import type { BookingListItem as BookingListItemType } from "../_queries";

export const BookingGroupSection = ({ label, items }: { label: string; items: BookingListItemType[] }) => {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {label} <span className="text-primary ml-1">{items.length}</span>
      </h2>
      <div className="space-y-3">
        {items.map((b) => <BookingListItem key={b.id} booking={b} />)}
      </div>
    </section>
  );
}