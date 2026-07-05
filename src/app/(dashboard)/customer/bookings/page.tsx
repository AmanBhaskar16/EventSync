
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCustomerBookings } from "./_queries";
import { BookingGroupSection } from "./components/booking-group-section";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Bookings" };

const CustomerBookingsPage = async () => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { bookings, grouped } = await getCustomerBookings(session.user.id);

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button asChild>
          <Link href="/vendors"><Search className="size-4" /> Find vendors</Link>
        </Button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <CalendarDays className="size-12 mx-auto text-muted-foreground opacity-30" />
          <p className="font-medium text-lg">No bookings yet</p>
          <p className="text-sm text-muted-foreground">Browse vendors and send your first inquiry.</p>
          <Button asChild><Link href="/vendors">Browse vendors</Link></Button>
        </div>
      ) : (
        <>
          <BookingGroupSection label="Active" items={grouped.Active} />
          <BookingGroupSection label="Completed" items={grouped.Completed} />
          <BookingGroupSection label="Cancelled" items={grouped.Cancelled} />
        </>
      )}
    </div>
  );
}

export default CustomerBookingsPage;