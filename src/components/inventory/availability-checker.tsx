"use client";

import { useState } from "react";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { formatCurrency } from "@/lib/utils";

type AvailabilityData = {
  itemId: string; 
  name: string; 
  date: string;
  totalQuantity: number; 
  maintenanceQty: number;
  reservedQty: number; 
  availableQty: number;
  unit: string; 
  isLowStock: boolean;
};

export function AvailabilityChecker({ itemId, unit }: { itemId: string; unit: string }) {
  const [date,setDate] = useState("");
  const [qty,setQty] = useState("");
  const [loading,setLoading] = useState(false);
  const [result, setResult] = useState<AvailabilityData | null>(null);
  const [error, setError] = useState("");

  async function check() {
    if (!date) return;
    setLoading(true); 
    setError(""); 
    setResult(null);
    try {
      const res  = await fetch(`/api/inventory/${itemId}/availability?date=${date}`);
      const data = await res.json() as { 
        success: boolean; 
        data?: AvailabilityData; 
        error?: string 
      };
      if (!data.success || !data.data) { 
        setError(data.error ?? "Failed."); 
        return; 
      }
      setResult(data.data);
    } catch { 
      setError("Network error."); 
    }finally{ 
      setLoading(false); 
    }
  }

  const canFulfill = result && Number(qty) > 0 ? result.availableQty >= Number(qty) : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Check Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="flex-1 h-9 text-sm" />
          <Input type="number" min={1} placeholder={`Qty (${unit})`}
            value={qty} onChange={(e) => setQty(e.target.value)}
            className="w-32 h-9 text-sm" />
          <Button size="sm" onClick={check} disabled={!date || loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Check"}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && (
          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Total",    value: result.totalQuantity  },
                { label: "Reserved", value: result.reservedQty    },
                { label: "Available",value: result.availableQty   },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-md bg-muted/50 p-2">
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                  <p className="text-base font-bold">{value} {unit}</p>
                </div>
              ))}
            </div>

            {qty && (
              <div className={`rounded-lg p-3 flex items-center gap-2 ${
                canFulfill
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}>
                {canFulfill
                  ? <CheckCircle  className="size-4 text-green-600 shrink-0" />
                  : <AlertTriangle className="size-4 text-red-600 shrink-0"  />
                }
                <p className={`text-sm font-medium ${canFulfill ? "text-green-800" : "text-red-800"}`}>
                  {canFulfill
                    ? `${qty} ${unit} available on this date`
                    : `Only ${result.availableQty} ${unit} available — insufficient for ${qty}`
                  }
                </p>
              </div>
            )}

            {result.isLowStock && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertTriangle className="size-3" /> Stock is running low on this date
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}