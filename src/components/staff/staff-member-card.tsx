
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Phone, Mail, Calendar, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { Button }  from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

type Member = {
  id: string; 
  name: string; 
  role: string; 
  roleLabel: string;
  phone: string | null; 
  email: string | null; 
  dailyRate: number | null;
  isActive: boolean;
  assignments: Array<{ id: string; date: Date; bookingId: string }>;
};

const ROLE_COLORS: Record<string, string> = {
  MANAGER: "bg-purple-100 text-purple-700", 
  CHEF: "bg-orange-100 text-orange-700",
  ASSISTANT: "bg-blue-100 text-blue-700",   
  DRIVER: "bg-green-100 text-green-700",
  COORDINATOR: "bg-pink-100 text-pink-700", 
  PHOTOGRAPHER: "bg-amber-100 text-amber-700",
  DECORATOR: "bg-rose-100 text-rose-700",   
  SECURITY: "bg-gray-100 text-gray-700",
  OTHER: "bg-muted text-muted-foreground",
};

export function StaffMemberCard({ member }: { member: Member }) {
  const router   = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleActive() {
    setLoading(true);
    try {

      const res  = await fetch(`/api/staff/${member.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isActive: !member.isActive }),
      });

      const data = await res.json() as { 
        success: boolean; 
        error?: string 
      };

      if (!data.success) { 
        toast.error(data.error ?? "Failed."); 
        return; 
      }

      toast.success(member.isActive ? "Marked inactive." : "Marked active.");
      router.refresh();
    } catch { 
      toast.error("Network error."); 
    }
    finally   { 
      setLoading(false); 
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove ${member.name} from your team?`)) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/staff/${member.id}`, { method: "DELETE" });

      const data = await res.json() as { 
        success: boolean; 
        error?: string 
      };

      if (!data.success) { 
        toast.error(data.error ?? "Failed."); 
        return; 
      }

      toast.success("Staff member removed.");

      router.refresh();
    } catch { 
      toast.error("Network error."); 
    }
    finally   { 
      setLoading(false); 
    }
  }

  const initials = member.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm">{member.name}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[member.role] ?? ROLE_COLORS.OTHER}`}>
                {member.roleLabel}
              </span>
            </div>
            {member.dailyRate && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatCurrency(member.dailyRate)} / day
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          {member.phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="size-3 shrink-0" />{member.phone}
            </div>
          )}
          {member.email && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="size-3 shrink-0" />{member.email}
            </div>
          )}
          {member.assignments.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="size-3 shrink-0" />
              Last assigned: {formatDate(member.assignments[0].date)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="ghost" size="sm"
            className="flex-1 text-xs"
            onClick={toggleActive}
            disabled={loading}
          >
            {member.isActive
              ? <><ToggleRight className="size-3.5 text-green-600" /> Active</>
              : <><ToggleLeft  className="size-3.5 text-muted-foreground" /> Inactive</>
            }
          </Button>
          <Button
            variant="ghost" size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}