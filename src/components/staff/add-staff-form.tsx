
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ROLES = [
  { value: "MANAGER", label: "Manager"},
  { value: "CHEF", label: "Chef"},
  { value: "ASSISTANT", label: "Assistant"},
  { value: "DRIVER", label: "Driver"},
  { value: "COORDINATOR", label: "Coordinator"},
  { value: "PHOTOGRAPHER",label: "Photographer"},
  { value: "DECORATOR", label: "Decorator"},
  { value: "SECURITY", label: "Security"},
  { value: "OTHER", label: "Other"},
];

export function AddStaffForm() {
  const router  = useRouter();
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", 
    role: "OTHER", 
    phone: "", 
    email: "", 
    dailyRate: "",
  });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required."); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/staff", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          role: form.role,
          phone: form.phone.trim()  || undefined,
          email: form.email.trim()  || undefined,
          dailyRate: form.dailyRate ? Number(form.dailyRate) : undefined,
        }),
      });
      const data = await res.json() as { 
        success: boolean; 
        error?: string 
      };

      if (!data.success) { 
        toast.error(data.error ?? "Failed."); 
        return; 
      }
      toast.success("Staff member added!");

      setForm({ 
        name: "", 
        role: "OTHER", 
        phone: "", 
        email: "", 
        dailyRate: "" 
      });

      setOpen(false);
      router.refresh();
    } catch { 
      toast.error("Network error."); 
    }
    finally { 
      setLoading(false); 
    }
  }

  if (!open) return (
    <Button onClick={() => setOpen(true)} variant="outline" className="w-full border-dashed">
      <UserPlus className="size-4" /> Add Staff Member
    </Button>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Add Staff Member</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full name" htmlFor="sname" required>
              <Input id="sname" placeholder="e.g. Raj Kumar"
                value={form.name} onChange={(e) => set("name", e.target.value)} />
            </FormField>
            <FormField label="Role" htmlFor="srole" required>
              <select id="srole" value={form.role} onChange={(e) => set("role", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone" htmlFor="sphone">
              <Input id="sphone" type="tel" placeholder="98765 43210"
                value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </FormField>
            <FormField label="Daily rate (₹)" htmlFor="srate">
              <Input id="srate" type="number" min={0} placeholder="e.g. 1500"
                value={form.dailyRate} onChange={(e) => set("dailyRate", e.target.value)} />
            </FormField>
          </div>
          <FormField label="Email" htmlFor="semail">
            <Input id="semail" type="email" placeholder="staff@example.com"
              value={form.email} onChange={(e) => set("email", e.target.value)} />
          </FormField>
          <div className="flex gap-3">
            <Button type="submit" className="flex-1" loading={loading}>Add member</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}