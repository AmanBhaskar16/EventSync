
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UNITS, SELECT_CLS, TEXTAREA_CLS } from "../_constants";
import type { NewServiceForm } from "../_types";

export function AddServiceForm({
  form,
  adding,
  onChange,
  onSubmit,
  onCancel,
}: {
  form: NewServiceForm;
  adding: boolean;
  onChange: (field: keyof NewServiceForm, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">New Service</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Service name" htmlFor="sname" required>
              <Input id="sname" placeholder="e.g. Full Catering Package"
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)} />
            </FormField>
            <FormField label="Unit" htmlFor="sunit" required>
              <select id="sunit" value={form.unit} className={SELECT_CLS}
                onChange={(e) => onChange("unit", e.target.value)}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </FormField>
          </div>

          <FormField label="Base price (₹)" htmlFor="sprice" required>
            <Input id="sprice" type="number" min={1} placeholder="e.g. 50000"
              value={form.basePrice}
              onChange={(e) => onChange("basePrice", e.target.value)} />
          </FormField>

          <FormField label="Description" htmlFor="sdesc">
            <textarea id="sdesc" rows={2} className={TEXTAREA_CLS}
              placeholder="What does this package include?"
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)} />
          </FormField>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" loading={adding}>Add Service</Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}