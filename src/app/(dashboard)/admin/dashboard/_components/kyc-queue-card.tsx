
import { CardShell } from "@/components/dashboard/card-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ListRow } from "@/components/dashboard/list-row";
import { Badge } from "@/components/ui/badge";
import { UserCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { AdminDashboardData } from "../_queries";

export const KycQueueCard = ({ vendors }: { vendors: AdminDashboardData["pendingVendors"] }) => {
  return (
    <CardShell title="KYC Review Queue" viewAllHref="/admin/kyc">
      {vendors.length === 0 ? (
        <EmptyState icon={UserCheck} message="No pending applications" />
      ) : (
        <div className="space-y-2">
          {vendors.map((v) => (
            <ListRow
              key={v.id}
              href={`/admin/kyc/${v.id}`}
              title={v.businessName}
              subtitle={v.user.email}
              trailing={
                <>
                  <Badge variant="warning" className="text-[10px]">Pending</Badge>
                  <span className="text-[10px] text-muted-foreground">{formatDate(v.createdAt)}</span>
                </>
              }
            />
          ))}
        </div>
      )}
    </CardShell>
  );
}