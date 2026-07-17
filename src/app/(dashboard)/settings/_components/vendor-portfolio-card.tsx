
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortfolioUpload } from "@/components/upload/portfolio-upload";
import type { UserData } from "../_types";

export const VendorPortfolioCard = ({ userData }: { userData: UserData }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Portfolio Photos</CardTitle>
        <p className="text-xs text-muted-foreground">
          Showcase your best work. These appear on your vendor profile.
        </p>
      </CardHeader>
      <CardContent>
        <PortfolioUpload
          currentImages={userData.vendor?.portfolioImages ?? []}
          vendorName={userData.vendor?.businessName ?? "Vendor"}
        />
      </CardContent>
    </Card>
  );
}