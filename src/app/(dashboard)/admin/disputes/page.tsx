
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DisputeResolveCard } from "@/components/admin/dispute-resolve-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Disputes" };

const AdminDisputesPage = async () => {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const disputes = await prisma.dispute.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, 
      reason: true, 
      description: true,
      status: true, 
      resolution: true, 
      createdAt: true,
      booking: {
        select: {
          id: true, 
          agreedPrice: true,
          vendor: { 
            select: { 
              businessName: true, 
              category: true 
            } 
          },
          event:  { 
            select: { 
              title: true, 
              eventDate: true, 
              customer: { 
                select: { 
                  user: { 
                    select: { 
                      name: true, 
                      email: true 
                    } 
                  } 
                } 
              } 
            } 
          },
        },
      },
    },
  });

  type DisputeRow = typeof disputes[number];

  const open     = (disputes as DisputeRow[]).filter((d) => d.status === "OPEN");
  const resolved = (disputes as DisputeRow[]).filter((d) => d.status !== "OPEN");

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Disputes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {open.length} open · {resolved.length} resolved
        </p>
      </div>

      {open.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <AlertCircle className="size-12 mx-auto text-green-500 opacity-60" />
          <p className="font-medium">No open disputes</p>
        </div>
      ) : (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Open <span className="text-red-600 ml-1">{open.length}</span>
          </h2>
          {open.map((d) => (
            <DisputeResolveCard key={d.id} dispute={d as DisputeRow} />
          ))}
        </section>
      )}

      {resolved.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Resolved <span className="ml-1">{resolved.length}</span>
          </h2>
          {resolved.slice(0, 5).map((d) => (
            <Card key={d.id} className="opacity-60">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-sm">{(d.booking.vendor as { businessName: string }).businessName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{d.reason}</p>
                </div>
                <Badge variant="success" className="text-[10px] shrink-0 ml-3">Resolved</Badge>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}

export default AdminDisputesPage;