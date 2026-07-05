
import { CardShell } from "@/components/dashboard/card-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ListRow } from "@/components/dashboard/list-row";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import type { AdminDashboardData } from "../_queries";

export const DisputesCard = ({ disputes }: { disputes: AdminDashboardData["openDisputes"] }) => {
  return (
    <CardShell title="Open Disputes" viewAllHref="/admin/disputes">
      {disputes.length === 0 ? (
        <EmptyState icon={AlertCircle} message="No open disputes" />
      ) : (
        <div className="space-y-2">
          {disputes.map((d) => (
            <ListRow
              key={d.id}
              href={`/admin/disputes/${d.id}`}
              title={d.booking.vendor.businessName}
              subtitle={d.reason}
              trailing={<Badge variant="destructive" className="text-[10px]">Open</Badge>}
            />
          ))}
        </div>
      )}
    </CardShell>
  );
}