
import Link from "next/link";
import type { ReactNode } from "react";

interface ListRowProps {
  href: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  className?: string;
}

export function ListRow({ href, title, subtitle, trailing, className = "" }: ListRowProps) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors ${className}`}
    >
      <div className="min-w-0">
        <p className="font-medium text-sm truncate">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
      </div>
      {trailing && <div className="flex flex-col items-end gap-1 shrink-0 ml-3">{trailing}</div>}
    </Link>
  );
}