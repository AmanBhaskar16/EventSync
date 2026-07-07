
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AccountOverviewCard }  from "./_components/account-overview-card";
import { PersonalInfoCard }  from "./_components/personal-info-card";
import { CustomerAddressCard } from "./_components/customer-address-card";
import { VendorBusinessCard } from "./_components/vendor-business-card";
import { VendorBankCard } from "./_components/vendor-bank-card";
import { VendorStatsCard } from "./_components/vendor-stats-card";
import { ChangePasswordCard } from "./_components/change-password-card";
import type { UserData, SaveFn } from "./_types";

const SettingsPage = () => {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [saving,   setSaving]  = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch("/api/settings");
        const data = await res.json() as { success: boolean; data?: UserData };
        if (data.success && data.data) setUserData(data.data);
      } catch {
        toast.error("Failed to load settings.");
      } finally {
        setFetching(false);
      }
    }
    load();
  }, []);

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

  if (fetching) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );

  if (!userData) return null;

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

export default SettingsPage;