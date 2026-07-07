
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UserData } from "../_types";

export const AccountOverviewCard = ({ userData, role }: { userData: UserData; role: string }) => {
  const initials = (userData.name ?? "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold">{userData.name ?? "—"}</p>
          <p className="text-sm text-muted-foreground">{userData.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-[10px]">{role}</Badge>
            {userData.vendor?.isVerified && (
              <Badge variant="success" className="text-[10px]">✓ Verified</Badge>
            )}
            {userData.vendor && (
              <Badge
                variant={userData.vendor.kycStatus === "APPROVED" ? "success" : "warning"}
                className="text-[10px]"
              >
                KYC: {userData.vendor.kycStatus}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}