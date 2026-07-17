
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KYCUpload } from "@/components/upload/kyc-upload";
import type { UserData } from "../_types";

export const VendorKycCard = ({ userData }: { userData: UserData }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">KYC Verification</CardTitle>
        <p className="text-xs text-muted-foreground">
          Get verified to appear in search results and receive bookings.
        </p>
      </CardHeader>
      <CardContent>
        <KYCUpload
          kycStatus={userData.vendor?.kycStatus ?? "PENDING"}
          kycDocuments={userData.vendor?.kycDocuments ?? []}
        />
      </CardContent>
    </Card>
  );
}