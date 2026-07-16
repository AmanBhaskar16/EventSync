
"use client";

import {
  Trash2, Pencil, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight, X, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { AddonSection } from "./addon-section";
import { UNITS, SELECT_CLS, TEXTAREA_CLS } from "../_constants";
import type { Service, EditServiceForm, AddonForm } from "../_types";

export function ServiceCard({
  service,
  isExpanded,
  isEditing,
  editForm,
  addonForm,
  saving,
  addingAddon,
  deletingAddon,
  onToggleExpand,
  onStartEdit,
  onCancelEdit,
  onEditChange,
  onSaveEdit,
  onDelete,
  onToggleActive,
  onAddonFieldChange,
  onAddAddon,
  onDeleteAddon,
}: {
  service: Service;
  isExpanded: boolean;
  isEditing: boolean;
  editForm: EditServiceForm;
  addonForm: AddonForm;
  saving: boolean;
  addingAddon: string | null;
  deletingAddon: string | null;
  onToggleExpand: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onEditChange: (field: keyof EditServiceForm, value: string) => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onAddonFieldChange: (field: keyof AddonForm, value: string) => void;
  onAddAddon: () => void;
  onDeleteAddon: (addonId: string) => void;
}) {
  return (
    <Card className={!service.isActive ? "opacity-60" : ""}>
      <CardContent className="p-0">
        <div className="p-5 space-y-3">
          {isEditing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Name" htmlFor={`en-${service.id}`} required>
                  <Input id={`en-${service.id}`} value={editForm.name}
                    onChange={(e) => onEditChange("name", e.target.value)} />
                </FormField>
                <FormField label="Unit" htmlFor={`eu-${service.id}`}>
                  <select id={`eu-${service.id}`} value={editForm.unit} className={SELECT_CLS}
                    onChange={(e) => onEditChange("unit", e.target.value)}>
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </FormField>
              </div>
              <FormField label="Base price (₹)" htmlFor={`ep-${service.id}`}>
                <Input id={`ep-${service.id}`} type="number" min={1} value={editForm.basePrice}
                  onChange={(e) => onEditChange("basePrice", e.target.value)} />
              </FormField>
              <FormField label="Description" htmlFor={`ed-${service.id}`}>
                <textarea id={`ed-${service.id}`} rows={2} className={TEXTAREA_CLS}
                  value={editForm.description}
                  onChange={(e) => onEditChange("description", e.target.value)} />
              </FormField>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={onSaveEdit} loading={saving}>
                  <Check className="size-4" /> Save
                </Button>
                <Button size="sm" variant="outline" onClick={onCancelEdit}>
                  <X className="size-4" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold">{service.name}</p>
                  <Badge variant={service.isActive ? "success" : "secondary"} className="text-[10px]">
                    {service.isActive ? "Active" : "Hidden"}
                  </Badge>
                  {service.addons.length > 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      {service.addons.length} addon{service.addons.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
                {service.description && (
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                )}
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(service.basePrice)}
                  <span className="text-xs font-normal text-muted-foreground ml-1">{service.unit}</span>
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button onClick={onToggleActive} title={service.isActive ? "Hide from profile" : "Show on profile"}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors">
                  {service.isActive
                    ? <ToggleRight className="size-5 text-green-600" />
                    : <ToggleLeft  className="size-5 text-muted-foreground" />
                  }
                </button>
                <button onClick={onStartEdit} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                  <Pencil className="size-4 text-muted-foreground" />
                </button>
                <button onClick={onDelete} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors">
                  <Trash2 className="size-4 text-destructive" />
                </button>
                <button onClick={onToggleExpand} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                  {isExpanded
                    ? <ChevronUp   className="size-4 text-muted-foreground" />
                    : <ChevronDown className="size-4 text-muted-foreground" />
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        {isExpanded && !isEditing && (
          <AddonSection
            serviceId={service.id}
            addons={service.addons}
            addonForm={addonForm}
            addingAddon={addingAddon}
            deletingAddon={deletingAddon}
            onFieldChange={onAddonFieldChange}
            onAdd={onAddAddon}
            onDelete={onDeleteAddon}
          />
        )}
      </CardContent>
    </Card>
  );
}