
"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SaveFn } from "../_types";

const INITIAL = { currentPassword: "", newPassword: "", confirmPassword: "" };

export const ChangePasswordCard = ({ isSaving, onSave }: { isSaving: boolean; onSave: SaveFn }) => {
  const [form, setForm] = useState(INITIAL);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) { 
      toast.error("New passwords do not match."); 
      return; 
    }

    if (form.newPassword.length < 8){ 
      toast.error("Password must be at least 8 characters."); 
      return; 
    }
    await onSave("password", { 
      currentPassword: form.currentPassword, 
      newPassword: form.newPassword 
    });
    setForm(INITIAL);
  }

  const canSubmit = form.currentPassword && form.newPassword && form.confirmPassword;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lock className="size-4 text-muted-foreground" /> Change Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField label="Current password" htmlFor="cpwd">
            <Input id="cpwd" type="password" placeholder="••••••••"
              value={form.currentPassword}
              onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="New password" htmlFor="npwd">
              <Input id="npwd" type="password" placeholder="••••••••"
                value={form.newPassword}
                onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} />
            </FormField>
            <FormField label="Confirm new password" htmlFor="cnpwd">
              <Input id="cnpwd" type="password" placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} />
            </FormField>
          </div>
          <Button type="submit" size="sm" loading={isSaving} disabled={!canSubmit}>
            <Lock className="size-4" /> Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}