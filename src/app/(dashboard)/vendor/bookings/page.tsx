import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getVendorBookingsPipeline, PIPELINE_STAGES } from "./_queries";
import { PipelineStageSection } from "./_components/pipeline-stage-section";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Bookings Pipeline" };

const VendorBookingsPage = async () => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { bookings, grouped, activeCount } = await getVendorBookingsPipeline(session.user.id);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bookings Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {activeCount} active &middot; {bookings.length} total
        </p>
      </div>

      <div className="space-y-6">
        {PIPELINE_STAGES.map((stage) => (
          <PipelineStageSection
            key={stage.key}
            label={stage.label}
            color={stage.color}
            dotColor={stage.dotColor}
            items={grouped[stage.key] ?? []}
          />
        ))}
      </div>
    </div>
  );
}

export default VendorBookingsPage;