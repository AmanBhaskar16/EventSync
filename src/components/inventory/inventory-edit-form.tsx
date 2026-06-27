
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  itemId: string;
  initialData: {
    name: string; 
    description: string | null; 
    totalQuantity: number;
    unit: string; 
    isReusable: boolean; 
    lowStockAlert: number; 
    maintenanceQty: number;
  };
};

const UNITS = ["units","pieces","kg","litres","sets","boxes","rolls","meters"];

export function InventoryEditForm({ itemId, initialData }: Props) {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    name:           initialData.name,
    description:    initialData.description ?? "",
    totalQuantity:  String(initialData.totalQuantity),
    unit:           initialData.unit,
    isReusable:     initialData.isReusable,
    lowStockAlert:  String(initialData.lowStockAlert),
    maintenanceQty: String(initialData.maintenanceQty),
  });

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await fetch(`/api/inventory/${itemId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:           form.name.trim(),
          description:    form.description.trim() || null,
          totalQuantity:  Number(form.totalQuantity),
          unit:           form.unit,
          isReusable:     form.isReusable,
          lowStockAlert:  Number(form.lowStockAlert),
          maintenanceQty: Number(form.maintenanceQty),
        }),
      });
      const data = await res.json() as { 
        success: boolean; 
        error?: string 
      };
      if (!data.success) { 
        toast.error(data.error ?? "Failed."); 
        return; 
      }
      toast.success("Item updated!");
      router.refresh();
    } catch { 
      toast.error("Network error."); 
    }finally{ 
      setLoading(false); 
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res  = await fetch(`/api/inventory/${itemId}`, { method: "DELETE" });
      const data = await res.json() as { 
        success: boolean; 
        error?: string 
      };
      if (!data.success) { 
        toast.error(data.error ?? "Failed."); 
        return; 
      }
      toast.success("Item deleted.");
      router.push("/vendor/inventory");
    } catch { 
      toast.error("Network error."); 
    }finally { 
      setDeleting(false); 
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Edit Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Item name" htmlFor="ename" required>
            <Input id="ename" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </FormField>

          <FormField label="Description" htmlFor="edesc">
            <textarea id="edesc" rows={2} value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Total quantity" htmlFor="eqty" required>
              <Input id="eqty" type="number" min={1} value={form.totalQuantity}
                onChange={(e) => set("totalQuantity", e.target.value)} />
            </FormField>
            <FormField label="Unit" htmlFor="eunit" required>
              <select id="eunit" value={form.unit} onChange={(e) => set("unit", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Maintenance qty" htmlFor="emaint">
              <Input id="emaint" type="number" min={0} value={form.maintenanceQty}
                onChange={(e) => set("maintenanceQty", e.target.value)} />
            </FormField>
            <FormField label="Low stock alert" htmlFor="ealert">
              <Input id="ealert" type="number" min={0} value={form.lowStockAlert}
                onChange={(e) => set("lowStockAlert", e.target.value)} />
            </FormField>
          </div>

          <FormField label="Type" htmlFor="etype">
            <select id="etype" value={form.isReusable ? "true" : "false"}
              onChange={(e) => set("isReusable", e.target.value === "true")}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="true">Reusable</option>
              <option value="false">Single-use</option>
            </select>
          </FormField>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" loading={loading}>Save changes</Button>
            <Button type="button" variant="outline"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleDelete} loading={deleting}>
              Delete
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}