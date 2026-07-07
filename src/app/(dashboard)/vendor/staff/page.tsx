
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { AddStaffForm } from "@/components/staff/add-staff-form";
import getVendorStaff  from "./_queries";
import { StaffSection } from "./_components/staff-section";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Staff" };

const StaffPage = async () => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { staff, active, inactive } = await getVendorStaff(session.user.id);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {active.length} active · {inactive.length} inactive
        </p>
      </div>

      <AddStaffForm />

      {staff.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <Users className="size-12 mx-auto text-muted-foreground opacity-30" />
          <p className="font-medium text-lg">No staff members yet</p>
          <p className="text-sm text-muted-foreground">Add your team above to assign them to bookings.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <StaffSection label="Active"   members={active}   />
          <StaffSection label="Inactive" members={inactive} dimmed />
        </div>
      )}
    </div>
  );
}

export default StaffPage;