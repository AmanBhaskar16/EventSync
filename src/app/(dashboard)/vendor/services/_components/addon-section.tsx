
"use client";

import { Tag, X, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { formatCurrency } from "@/lib/utils";
import type { Addon, AddonForm } from "../_types";

export function AddonSection({
  serviceId,
  addons,
  addonForm,
  addingAddon,
  deletingAddon,
  onFieldChange,
  onAdd,
  onDelete,
}: {
  serviceId: string;
  addons: Addon[];
  addonForm: AddonForm;
  addingAddon: string | null;
  deletingAddon: string | null;
  onFieldChange: (field: keyof AddonForm, value: string) => void;
  onAdd: () => void;
  onDelete: (addonId: string) => void;
}) {
  return (
    <div className="border-t border-border px-5 py-4 space-y-4 bg-muted/20">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
        <Tag className="size-3.5" /> Add-ons
      </p>

      {addons.length > 0 && (
        <div className="space-y-2">
          {addons.map((addon) => (
            <div key={addon.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
              <div>
                <p className="text-sm font-medium">{addon.name}</p>
                <p className="text-xs text-muted-foreground">+{formatCurrency(addon.price)}</p>
              </div>
              <button
                onClick={() => onDelete(addon.id)}
                disabled={deletingAddon === addon.id}
                className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
              >
                {deletingAddon === addon.id
                  ? <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  : <X className="size-4 text-destructive" />
                }
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <FormField label="Addon name" htmlFor={`an-${serviceId}`} className="flex-1">
          <Input id={`an-${serviceId}`} placeholder="e.g. Live counter"
            value={addonForm.name}
            onChange={(e) => onFieldChange("name", e.target.value)} />
        </FormField>
        <FormField label="Price (₹)" htmlFor={`ap-${serviceId}`} className="w-28">
          <Input id={`ap-${serviceId}`} type="number" min={0} placeholder="0"
            value={addonForm.price}
            onChange={(e) => onFieldChange("price", e.target.value)} />
        </FormField>
        <Button
          size="sm" className="mb-0.5"
          onClick={onAdd}
          loading={addingAddon === serviceId}
          disabled={!addonForm.name || !addonForm.price}
        >
          <Plus className="size-4" /> Add
        </Button>
      </div>
    </div>
  );
}