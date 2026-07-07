
"use client";

import { useState } from "react";
import { User, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INDIAN_STATES, SELECT_CLS } from "../_constants";
import type { UserData, SaveFn } from "../_types";

export const CustomerAddressCard = ({ userData, isSaving, onSave }: {
  userData: UserData;
  isSaving: boolean;
  onSave: SaveFn;
}) => {
  const [form, setForm] = useState({
    address: userData.customer?.address ?? "",
    city:  userData.customer?.city ?? "",
    state: userData.customer?.state ?? "",
    pincode: userData.customer?.pincode ?? "",
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="size-4 text-muted-foreground" /> Address
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField label="Address" htmlFor="caddr">
          <Input id="caddr" placeholder="House / Street / Area" value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        </FormField>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="City" htmlFor="ccity">
            <Input id="ccity" value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          </FormField>
          <FormField label="State" htmlFor="cstate">
            <select id="cstate" value={form.state} className={SELECT_CLS}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}>
              <option value="">Select</option>
              {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField label="Pincode" htmlFor="cpin">
            <Input id="cpin" value={form.pincode}
              onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} />
          </FormField>
        </div>
        <Button size="sm" onClick={() => onSave("customer", form)} loading={isSaving}>
          <Save className="size-4" /> Save address
        </Button>
      </CardContent>
    </Card>
  );
}