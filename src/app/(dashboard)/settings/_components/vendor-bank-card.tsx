
"use client";

import { useState } from "react";
import { CreditCard, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserData, SaveFn } from "../_types";

export const VendorBankCard = ({ userData, isSaving, onSave }: {
  userData: UserData;
  isSaving: boolean;
  onSave: SaveFn;
}) => {
  const [form, setForm] = useState({
    bankName: userData.vendor?.bankName ?? "",
    bankAccountNo: userData.vendor?.bankAccountNo ?? "",
    bankIfsc: userData.vendor?.bankIfsc ?? "",
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="size-4 text-muted-foreground" /> Bank Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">Required for receiving payouts from completed bookings.</p>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Bank name" htmlFor="bname">
            <Input id="bname" placeholder="e.g. HDFC Bank" value={form.bankName}
              onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))} />
          </FormField>
          <FormField label="IFSC code" htmlFor="bifsc">
            <Input id="bifsc" placeholder="e.g. HDFC0001234" value={form.bankIfsc}
              onChange={(e) => setForm((f) => ({ ...f, bankIfsc: e.target.value }))} />
          </FormField>
        </div>
        <FormField label="Account number" htmlFor="bacc">
          <Input id="bacc" placeholder="Account number" value={form.bankAccountNo}
            onChange={(e) => setForm((f) => ({ ...f, bankAccountNo: e.target.value }))} />
        </FormField>
        <Button size="sm" onClick={() => onSave("bank", form)} loading={isSaving}>
          <Save className="size-4" /> Save bank details
        </Button>
      </CardContent>
    </Card>
  );
}