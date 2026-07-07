
"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DownloadInvoiceButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${bookingId}`);
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        toast.error(data.error ?? "Failed to generate invoice.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${bookingId.slice(-8).toUpperCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Invoice downloaded!");
    } catch { 
      toast.error("Network error."); 
    }
    finally { 
      setLoading(false); 
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} disabled={loading}>
      {loading
        ? <Loader2 className="size-4 animate-spin" />
        : <FileText  className="size-4" />
      }
      Download Invoice (PDF)
    </Button>
  );
}