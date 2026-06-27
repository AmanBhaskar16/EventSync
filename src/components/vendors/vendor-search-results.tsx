// Client component — fetches /api/vendors and renders grid + pagination

"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Loader2, SearchX } from "lucide-react";
import { VendorCard, type VendorCardData } from "./vendor-card";
import { Button } from "@/components/ui/button";

type Pagination = { total: number; page: number; pageSize: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean };

export function VendorSearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [vendors,setVendors] = useState<VendorCardData[]>([]);
  const [pagination,setPagination] = useState<Pagination | null>(null);
  const [loading,setLoading] = useState(true);
  const [error, setError]= useState("");

  const fetchVendors = useCallback(async () => {
    setLoading(true); 
    setError("");
    try {
      const res  = await fetch(`/api/vendors?${searchParams.toString()}`);
      const data = await res.json() as { 
        success: boolean; 
        data?: { 
          vendors: VendorCardData[]; 
          pagination: Pagination 
        }; 
        error?: string 
      };
      if (!data.success || !data.data) throw new Error(data.error ?? "Failed");
      setVendors(data.data.vendors);
      setPagination(data.data.pagination);
    } catch { 
      setError("Failed to load vendors. Please try again."); 
    }
    finally { 
      setLoading(false); 
    }
  }, [searchParams]);

  useEffect(() => { 
    fetchVendors(); 
  }, [fetchVendors]);

  function goToPage(page: number) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("page", String(page));
    router.push(`${pathname}?${next.toString()}`);
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Finding vendors for you…</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <SearchX className="size-10 text-muted-foreground opacity-40" />
      <p className="text-sm text-muted-foreground">{error}</p>
      <Button variant="outline" size="sm" onClick={fetchVendors}>Try again</Button>
    </div>
  );

  if (vendors.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
      <SearchX className="size-10 text-muted-foreground opacity-40" />
      <p className="font-medium">No vendors found</p>
      <p className="text-sm text-muted-foreground max-w-xs">Try adjusting your filters or searching in a different city.</p>
    </div>
  );

  const start = ((pagination?.page ?? 1) - 1) * (pagination?.pageSize ?? 12) + 1;
  const end   = Math.min((pagination?.page ?? 1) * (pagination?.pageSize ?? 12), pagination?.total ?? 0);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{start}–{end}</span> of{" "}
        <span className="font-medium text-foreground">{pagination?.total ?? 0}</span> vendors
      </p>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {vendors.map((v) => <VendorCard key={v.id} vendor={v} />)}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" disabled={!pagination.hasPrevPage} onClick={() => goToPage(pagination.page - 1)}>Previous</Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => goToPage(p)}
                className={p === pagination.page
                  ? "size-8 rounded-md bg-primary text-primary-foreground text-xs font-semibold"
                  : "size-8 rounded-md hover:bg-muted text-xs text-muted-foreground"}>
                {p}
              </button>
            ))}
            {pagination.totalPages > 7 && <span className="text-xs text-muted-foreground px-1">… {pagination.totalPages}</span>}
          </div>
          <Button variant="outline" size="sm" disabled={!pagination.hasNextPage} onClick={() => goToPage(pagination.page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}