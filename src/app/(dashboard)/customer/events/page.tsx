
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCustomerEvents } from "./_queries";
import { EventSection } from "./_components/event-section";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Events" };

export default async function CustomerEventsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { events, upcoming, past } = await getCustomerEvents(session.user.id);

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Events</h1>
          <p className="text-sm text-muted-foreground mt-1">{events.length} event{events.length !== 1 ? "s" : ""} total</p>
        </div>
        <Button asChild>
          <Link href="/customer/events/new"><Plus className="size-4" /> New Event</Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <CalendarDays className="size-12 mx-auto text-muted-foreground opacity-30" />
          <p className="font-medium text-lg">No events yet</p>
          <p className="text-sm text-muted-foreground">Create your first event to start booking vendors.</p>
          <Button asChild><Link href="/customer/events/new">Create event</Link></Button>
        </div>
      ) : (
        <>
          <EventSection label="Upcoming" events={upcoming} />
          <EventSection label="Past" events={past} dimmed />
        </>
      )}
    </div>
  );
}