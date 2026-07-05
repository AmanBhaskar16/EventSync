
import Link        from "next/link";
import { SearchX } from "lucide-react";
import { Button }  from "@/components/ui/button";
import { Navbar }  from "@/components/shared/navbar";

const VendorNotFound = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 space-y-6">
        <div className="size-20 rounded-full bg-muted flex items-center justify-center">
          <SearchX className="size-9 text-muted-foreground opacity-60" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Vendor not found</h1>
          <p className="text-muted-foreground max-w-sm">
            This vendor may have been removed or the link is incorrect.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild><Link href="/vendors">Browse all vendors</Link></Button>
          <Button variant="outline" asChild><Link href="/">Go home</Link></Button>
        </div>
      </div>
    </div>
  );
}

export default VendorNotFound;