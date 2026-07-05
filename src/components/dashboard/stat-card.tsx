
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  href?: string;
}

interface StatGridProps {
  stats: StatCardProps[];
  columns?: 3 | 4;
}

export function StatCard({ label, value, icon: Icon, color, href }: StatCardProps) {
  const content = (
    <Card className={href ? "hover:shadow-md hover:border-primary/20 transition-all cursor-pointer h-full" : "h-full"}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className="text-xl font-bold mt-1 leading-tight">{value}</p>
          </div>
          <Icon className={`size-7 opacity-60 shrink-0 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export function StatGrid({ stats,columns = 4 }:StatGridProps) {
  const colsClass = columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  return (
    <div className={`grid grid-cols-2 ${colsClass} gap-4`}>
      {stats.map((s) => <StatCard key={s.label} {...s} />)}
    </div>
  );
}