"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewInventoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", 
    description: "", 
    totalQuantity: "",
    unit: "units", 
    isReusable: true, 
    lowStockAlert: "5",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if(!form.name.trim()) e.name = "Name is required.";
    if(!form.totalQuantity || Number(form.totalQuantity)<1) e.totalQuantity = "Quantity must be at least 1.";
    if (!form.unit.trim()) e.unit = "Unit is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/inventory", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:          form.name.trim(),
          description:   form.description.trim() || undefined,
          totalQuantity: Number(form.totalQuantity),
          unit:          form.unit.trim(),
          isReusable:    form.isReusable,
          lowStockAlert: Number(form.lowStockAlert) || 5,
        }),
      });
      const data = await res.json() as { 
        success: boolean; 
        error?: string 
      };
      if(!res.ok || !data.success){ 
        toast.error(data.error ?? "Failed to create item."); 
        return;
      }
      toast.success("Item added to inventory!");
      router.push("/vendor/inventory");
    } catch { 
      toast.error("Network error."); 
    }
    finally{ 
      setLoading(false); 
    }
  }

  const UNITS = ["units", "pieces", "kg", "litres", "sets", "boxes", "rolls", "meters"];

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/vendor/inventory"><ArrowLeft className="size-4" /> Back</Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Inventory Item</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add a resource you own and want to track across bookings.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            
            <FormField label="Item name" htmlFor="name" required error={errors.name}>
              <Input id="name" placeholder="e.g. Folding Chairs"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                error={!!errors.name} />
            </FormField>

            <FormField label="Description" htmlFor="desc">
              <textarea id="desc" rows={2} placeholder="Optional details…"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground resize-none" />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Total quantity" htmlFor="qty" required error={errors.totalQuantity}>
                <Input id="qty" type="number" min={1} placeholder="e.g. 500"
                  value={form.totalQuantity}
                  onChange={(e) => setForm((f) => ({ ...f, totalQuantity: e.target.value }))}
                  error={!!errors.totalQuantity} />
              </FormField>

              <FormField label="Unit" htmlFor="unit" required error={errors.unit}>
                <select id="unit" value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Low stock alert at" htmlFor="alert">
                <Input id="alert" type="number" min={0} placeholder="5"
                  value={form.lowStockAlert}
                  onChange={(e) => setForm((f) => ({ ...f, lowStockAlert: e.target.value }))} />
              </FormField>

              <FormField label="Type" htmlFor="reusable">
                <select id="reusable"
                  value={form.isReusable ? "true" : "false"}
                  onChange={(e) => setForm((f) => ({ ...f, isReusable: e.target.value === "true" }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="true">Reusable</option>
                  <option value="false">Single-use</option>
                </select>
              </FormField>
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Add to Inventory
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}