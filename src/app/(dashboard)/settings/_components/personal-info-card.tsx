
"use client";

import { useState } from "react";
import { User, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserData, SaveFn } from "../_types";

export const PersonalInfoCard = ({ userData, isSaving, onSave }: {
  userData: UserData;
  isSaving: boolean;
  onSave: SaveFn;
}) => {
  const [form, setForm] = useState({
    name: userData.name  ?? "",
    phone: userData.phone ?? "",
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="size-4 text-muted-foreground" /> Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Full name" htmlFor="pname">
            <Input id="pname" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </FormField>
          <FormField label="Mobile" htmlFor="pphone">
            <Input id="pphone" type="tel" value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </FormField>
        </div>
        <FormField label="Email" htmlFor="pemail">
          <Input id="pemail" value={userData.email} disabled className="opacity-60 cursor-not-allowed" />
        </FormField>
        <Button size="sm" onClick={() => onSave("profile", form)} loading={isSaving}>
          <Save className="size-4" /> Save changes
        </Button>
      </CardContent>
    </Card>
  );
}