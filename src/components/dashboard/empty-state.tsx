
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  action?: { label: string; href: string };
}

export function EmptyState({ icon: Icon, message, action }: EmptyStateProps) {
  return (
    <div className="text-center py-10 space-y-2">
      <Icon className="size-8 mx-auto text-muted-foreground opacity-40" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {action && (
        <Button variant="outline" size="sm" asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}