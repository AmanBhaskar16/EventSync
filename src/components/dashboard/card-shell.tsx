
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface CardShellProps {
  title: string;
  viewAllHref?: string;
  badge?: ReactNode;
  children: ReactNode;
}

export function CardShell({ title, viewAllHref, badge, children }: CardShellProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          {badge}
        </div>
        {viewAllHref && (
          <Button variant="ghost" size="sm" asChild>
            <Link href={viewAllHref}>All <ArrowRight className="size-3 ml-1" /></Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}