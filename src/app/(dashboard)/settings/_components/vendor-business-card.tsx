
"use client";

import { useState } from "react";
import { Building2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INDIAN_STATES, VENDOR_CATEGORIES, CATEGORY_LABELS, SELECT_CLS, TEXTAREA_CLS } from "../_constants";
import type { UserData, SaveFn } from "../_types";

export const VendorBusinessCard = ({ userData, isSaving, onSave }: {
  userData: UserData;
  isSaving: boolean;
  onSave: SaveFn;
}) => {
  const v = userData.vendor;
  const [form, setForm] = useState({
    businessName:  v?.businessName ?? "",
    description: v?.description ?? "",
    category: v?.category ?? "",
    city: v?.city ?? "",
    state: v?.state ?? "",
    pincode: v?.pincode ?? "",
    serviceRadius: String(v?.serviceRadius ?? 50),
    gstin: v?.gstin ?? "",
    pan: v?.pan ?? "",
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="size-4 text-muted-foreground" /> Business Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Business name" htmlFor="vbname" required>
            <Input id="vbname" value={form.businessName}
              onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))} />
          </FormField>
          <FormField label="Category" htmlFor="vcat">
            <select id="vcat" value={form.category} className={SELECT_CLS}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {VENDOR_CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Description" htmlFor="vdesc">
          <textarea id="vdesc" rows={3} className={TEXTAREA_CLS}
            placeholder="Describe your business, specialties, years of experience…"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </FormField>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="City" htmlFor="vcity">
            <Input id="vcity" value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          </FormField>
          <FormField label="State" htmlFor="vstate">
            <select id="vstate" value={form.state} className={SELECT_CLS}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}>
              <option value="">Select</option>
              {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField label="Pincode" htmlFor="vpin">
            <Input id="vpin" value={form.pincode}
              onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} />
          </FormField>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="GSTIN" htmlFor="vgstin">
            <Input id="vgstin" placeholder="22AAAAA0000A1Z5" value={form.gstin}
              onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value }))} />
          </FormField>
          <FormField label="PAN" htmlFor="vpan">
            <Input id="vpan" placeholder="AAAAA0000A" value={form.pan}
              onChange={(e) => setForm((f) => ({ ...f, pan: e.target.value }))} />
          </FormField>
          <FormField label="Service radius (km)" htmlFor="vrad">
            <Input id="vrad" type="number" min={1} value={form.serviceRadius}
              onChange={(e) => setForm((f) => ({ ...f, serviceRadius: e.target.value }))} />
          </FormField>
        </div>
        <Button size="sm" loading={isSaving}
          onClick={() => onSave("vendor", { ...form, serviceRadius: Number(form.serviceRadius) })}>
          <Save className="size-4" /> Save business profile
        </Button>
      </CardContent>
    </Card>
  );
}