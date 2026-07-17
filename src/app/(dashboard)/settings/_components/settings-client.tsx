
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { AccountOverviewCard }  from "./account-overview-card";
import { PersonalInfoCard }     from "./personal-info-card";
import { CustomerAddressCard }  from "./customer-address-card";
import { VendorBusinessCard }   from "./vendor-business-card";
import { VendorPortfolioCard }  from "./vendor-portfolio-card";
import { VendorKycCard }        from "./vendor-kyc-card";
import { VendorBankCard }       from "./vendor-bank-card";
import { VendorStatsCard }      from "./vendor-stats-card";
import { ChangePasswordCard }   from "./change-password-card";
import type { UserData, SaveFn } from "../_types";

export const SettingsClient = ({ userData }: { userData: UserData }) => {
  const { data: session } = useSession();
  const [saving, setSaving] = useState<string | null>(null);

  const save: SaveFn = async (section, data) => {
    setSaving(section);
    try {
      const res    = await fetch("/api/settings", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const result = await res.json() as { success: boolean; error?: string };
      if (!result.success) { toast.error(result.error ?? "Failed."); return; }
      toast.success("Saved!");
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(null);
    }
  };

  const role = session?.user?.role;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and profile.</p>
      </div>

      <AccountOverviewCard userData={userData} role={role ?? ""} />

      <PersonalInfoCard
        userData={userData}
        isSaving={saving === "profile"}
        onSave={save}
      />

      {role === "CUSTOMER" && (
        <CustomerAddressCard
          userData={userData}
          isSaving={saving === "customer"}
          onSave={save}
        />
      )}

      {role === "VENDOR" && (
        <>
          <VendorBusinessCard
            userData={userData}
            isSaving={saving === "vendor"}
            onSave={save}
          />
          <VendorPortfolioCard userData={userData} />
          <VendorKycCard userData={userData} />
          <VendorBankCard
            userData={userData}
            isSaving={saving === "bank"}
            onSave={save}
          />
          {userData.vendor && <VendorStatsCard vendor={userData.vendor} />}
        </>
      )}

      <ChangePasswordCard isSaving={saving === "password"} onSave={save} />
    </div>
  );
}