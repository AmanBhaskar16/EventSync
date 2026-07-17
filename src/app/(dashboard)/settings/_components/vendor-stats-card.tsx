"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserData } from "../_types";

export const VendorStatsCard = ({ vendor }: { vendor: NonNullable<UserData["vendor"]> }) => {
  const stats = [
    { label: "Avg Rating", 
      value: vendor.avgRating > 0 ? `${vendor.avgRating.toFixed(1)} ★` : "—" 
    },
    { 
      label: "Total Reviews", 
      value: vendor.totalReviews  
    },
    { 
      label: "Total Bookings", 
      value: vendor.totalBookings 
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Platform Stats</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-3 gap-4 text-center">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-lg bg-muted/50 p-3">
            <p className="text-lg font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}