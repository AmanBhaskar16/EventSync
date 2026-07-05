
import { BookingPipelineCard } from "./booking-pipeline-card";
import type { PipelineBooking } from "../_queries";

interface StageProps {
  label: string;
  color: string;
  dotColor: string;
  items: PipelineBooking[];
}

export const PipelineStageSection = ({ label, color, dotColor, items }: StageProps) => {
  const dashedBorderClass = color.split(" ")[0].replace("border-", "border-dashed border-");

  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-sm font-semibold">{label}</h2>
        <span className="size-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <div className={`rounded-xl border-2 border-dashed p-4 text-center text-xs text-muted-foreground ${dashedBorderClass}`}>
          No bookings in this stage
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {items.map((b) => <BookingPipelineCard key={b.id} booking={b} borderColor={dotColor} />)}
        </div>
      )}
    </section>
  );
}