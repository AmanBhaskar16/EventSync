// // src/app/(dashboard)/customer/dashboard/page.tsx
// // URL: /customer/dashboard
// //
// // Server component — fetches customer's events and bookings from DB.
// // Feature 1 version: shows stat cards and empty states.
// // Booking/event data queries are stubs — full data arrives in Feature 3 (Event Builder).

// import { auth }            from "@/lib/auth";
// import { redirect }        from "next/navigation";
// import { prisma }          from "@/lib/db/prisma";
// import Link                from "next/link";
// import { CalendarDays, Users, CreditCard, TrendingUp, Plus } from "lucide-react";
// import { Button }          from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge }           from "@/components/ui/badge";
// import { getGreeting, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, formatDate } from "@/lib/utils";
// import type { Metadata }   from "next";

// export const metadata: Metadata = { title: "Dashboard" };

// export default async function CustomerDashboardPage() {
//   const session = await auth();
//   if (!session?.user) redirect("/login");

//   // Fetch customer profile with recent events
//   const customer = await prisma.customer.findUnique({
//     where:   { userId: session.user.id },
//     include: {
//       events: {
//         orderBy: { eventDate: "asc" },
//         take:    5,
//         include: { bookings: { select: { id: true } } },
//       },
//     },
//   });

//   // Fetch recent bookings separately for the bookings card
//   const recentBookings = customer
//     ? await prisma.booking.findMany({
//         where:   { event: { customerId: customer.id } },
//         include: {
//           vendor: { select: { businessName: true } },
//           event:  { select: { title: true } },
//         },
//         orderBy: { createdAt: "desc" },
//         take:    4,
//       })
//     : [];

//   const now      = new Date();
//   const events   = (customer?.events ?? []) as Array<{
//     id: string; title: string; type: string; eventDate: Date; city: string | null;
//     bookings: { id: string }[];
//   }>;
//   const bookings = recentBookings as unknown as Array<{
//     id: string; status: string; agreedPrice: number | null;
//     vendor: { businessName: string };
//     event:  { title: string };
//   }>;

//   const stats = {
//     totalEvents:       events.length,
//     upcomingEvents:    events.filter((e) => new Date(e.eventDate) > now).length,
//     totalBookings:     bookings.length,
//     confirmedBookings: bookings.filter((b) => b.status === "CONFIRMED").length,
//   };

//   const firstName = session.user.name?.split(" ")[0] ?? "there";

//   return (
//     <div className="space-y-8 max-w-6xl">

//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">
//             Good {getGreeting()}, {firstName} 👋
//           </h1>
//           <p className="text-muted-foreground text-sm mt-1">
//             Here&apos;s what&apos;s happening with your events.
//           </p>
//         </div>
//         <Button asChild>
//           <Link href="/customer/events/new">
//             <Plus className="size-4" /> New Event
//           </Link>
//         </Button>
//       </div>

//       {/* Stat cards */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//         {[
//           { label: "Total Events",   value: stats.totalEvents,       icon: CalendarDays, color: "text-primary"   },
//           { label: "Upcoming",       value: stats.upcomingEvents,    icon: TrendingUp,   color: "text-blue-600"  },
//           { label: "Total Bookings", value: stats.totalBookings,     icon: Users,        color: "text-purple-600"},
//           { label: "Confirmed",      value: stats.confirmedBookings, icon: CreditCard,   color: "text-green-600" },
//         ].map((s) => (
//           <Card key={s.label}>
//             <CardContent className="p-5">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
//                   <p className="text-3xl font-bold mt-1">{s.value}</p>
//                 </div>
//                 <s.icon className={`size-8 ${s.color} opacity-60`} />
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       <div className="grid lg:grid-cols-2 gap-6">

//         {/* Upcoming events */}
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-3">
//             <CardTitle className="text-base">Upcoming Events</CardTitle>
//             <Button variant="ghost" size="sm" asChild>
//               <Link href="/customer/events">View all</Link>
//             </Button>
//           </CardHeader>
//           <CardContent className="pt-0">
//             {events.filter((e) => new Date(e.eventDate) > now).length === 0 ? (
//               <div className="text-center py-10 space-y-3">
//                 <CalendarDays className="size-8 mx-auto text-muted-foreground opacity-40" />
//                 <p className="text-sm text-muted-foreground">No upcoming events</p>
//                 <Button variant="outline" size="sm" asChild>
//                   <Link href="/customer/events/new">Create your first event</Link>
//                 </Button>
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 {events
//                   .filter((e) => new Date(e.eventDate) > now)
//                   .slice(0, 4)
//                   .map((event) => (
//                     <Link
//                       key={event.id}
//                       href={`/customer/events/${event.id}`}
//                       className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
//                     >
//                       <div className="min-w-0">
//                         <p className="font-medium text-sm truncate">{event.title}</p>
//                         <p className="text-xs text-muted-foreground mt-0.5">
//                           {event.city ?? "—"} · {event.bookings.length} vendor{event.bookings.length !== 1 ? "s" : ""}
//                         </p>
//                       </div>
//                       <p className="text-xs font-semibold shrink-0 ml-3">
//                         {formatDate(event.eventDate)}
//                       </p>
//                     </Link>
//                   ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Recent bookings */}
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-3">
//             <CardTitle className="text-base">Recent Bookings</CardTitle>
//             <Button variant="ghost" size="sm" asChild>
//               <Link href="/customer/bookings">View all</Link>
//             </Button>
//           </CardHeader>
//           <CardContent className="pt-0">
//             {bookings.length === 0 ? (
//               <div className="text-center py-10 space-y-2">
//                 <Users className="size-8 mx-auto text-muted-foreground opacity-40" />
//                 <p className="text-sm text-muted-foreground">No bookings yet</p>
//                 <Button variant="outline" size="sm" asChild>
//                   <Link href="/vendors">Browse vendors</Link>
//                 </Button>
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 {bookings.map((b) => (
//                   <Link
//                     key={b.id}
//                     href={`/customer/bookings/${b.id}`}
//                     className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
//                   >
//                     <div className="min-w-0">
//                       <p className="font-medium text-sm truncate">{b.vendor.businessName}</p>
//                       <p className="text-xs text-muted-foreground mt-0.5 truncate">{b.event.title}</p>
//                     </div>
//                     <Badge
//                       variant="outline"
//                       className={`text-[10px] px-1.5 py-0.5 shrink-0 ml-2 ${BOOKING_STATUS_COLORS[b.status] ?? ""}`}
//                     >
//                       {BOOKING_STATUS_LABELS[b.status] ?? b.status}
//                     </Badge>
//                   </Link>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>

//       </div>
//     </div>
//   );
// }

// src/app/(dashboard)/customer/dashboard/page.tsx
import { auth }            from "@/lib/auth";
import { redirect }        from "next/navigation";
import { prisma }          from "@/lib/db/prisma";
import Link                from "next/link";
import { CalendarDays, Users, CreditCard, TrendingUp, Plus } from "lucide-react";
import { Button }          from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge }           from "@/components/ui/badge";
import { getGreeting, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, formatDate } from "@/lib/utils";
import type { Metadata }   from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function CustomerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch customer profile only — events/bookings added in Feature 3
  const customer = await prisma.customer.findUnique({
    where: { userId: session.user.id },
  });

  // Stubbed until Feature 3 adds Event + Booking models to schema
  const events   : Array<{ id: string; title: string; type: string; eventDate: Date; city: string | null; bookings: { id: string }[] }> = [];
  const bookings : Array<{ id: string; status: string; agreedPrice: number | null; vendor: { businessName: string }; event: { title: string } }> = [];

  const now  = new Date();
  const stats = {
    totalEvents:       0,
    upcomingEvents:    0,
    totalBookings:     0,
    confirmedBookings: 0,
  };

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8 max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Good {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s what&apos;s happening with your events.
          </p>
        </div>
        <Button asChild>
          <Link href="/customer/events/new">
            <Plus className="size-4" /> New Event
          </Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Events",   value: stats.totalEvents,       icon: CalendarDays, color: "text-primary"    },
          { label: "Upcoming",       value: stats.upcomingEvents,    icon: TrendingUp,   color: "text-blue-600"   },
          { label: "Total Bookings", value: stats.totalBookings,     icon: Users,        color: "text-purple-600" },
          { label: "Confirmed",      value: stats.confirmedBookings, icon: CreditCard,   color: "text-green-600"  },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                </div>
                <s.icon className={`size-8 ${s.color} opacity-60`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Upcoming events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Upcoming Events</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/customer/events">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center py-10 space-y-3">
              <CalendarDays className="size-8 mx-auto text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground">No upcoming events</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/customer/events/new">Create your first event</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/customer/bookings">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center py-10 space-y-2">
              <Users className="size-8 mx-auto text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground">No bookings yet</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/vendors">Browse vendors</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}