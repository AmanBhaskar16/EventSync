
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvatarUpload } from "@/components/upload/avatar-upload";
import type { UserData } from "../_types";

export const AccountOverviewCard = ({ userData, role }: { userData: UserData; role: string }) => {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-5">
        <AvatarUpload
          currentAvatar={userData.avatar}
          name={userData.name ?? "U"}
          size="lg"
        />
        <div className="min-w-0">
          <p className="font-semibold text-lg">{userData.name ?? "—"}</p>
          <p className="text-sm text-muted-foreground">{userData.email}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant="secondary" className="text-[10px]">{role}</Badge>
            {userData.vendor?.isVerified && (
              <Badge variant="success" className="text-[10px]">✓ Verified</Badge>
            )}
            {userData.vendor && (
              <Badge
                variant={
                  userData.vendor.kycStatus === "APPROVED"  ? "success" :
                  userData.vendor.kycStatus === "UNDER_REVIEW" ? "warning" : "secondary"
                }
                className="text-[10px]"
              >
                KYC: {userData.vendor.kycStatus}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Click on photo to change</p>
        </div>
      </CardContent>
    </Card>
  );
}