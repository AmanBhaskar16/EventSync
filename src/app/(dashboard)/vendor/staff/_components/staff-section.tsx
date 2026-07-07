
import { StaffMemberCard } from "@/components/staff/staff-member-card";
import { ROLE_LABELS, type StaffMember } from "../_queries";

export const StaffSection = ({
  label,
  members,
  dimmed = false,
}: {
  label: string;
  members: StaffMember[];
  dimmed?: boolean;
}) => {
  if (members.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {label} <span className={dimmed ? "ml-1" : "text-primary ml-1"}>{members.length}</span>
      </h2>
      <div className={`grid sm:grid-cols-2 gap-4 ${dimmed ? "opacity-60" : ""}`}>
        {members.map((member) => (
          <StaffMemberCard
            key={member.id}
            member={{
              ...member,
              roleLabel:   ROLE_LABELS[member.role] ?? member.role,
              assignments: member.assignments as Array<{ id: string; date: Date; bookingId: string }>,
            }}
          />
        ))}
      </div>
    </section>
  );
}