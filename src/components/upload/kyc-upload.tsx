// src/components/upload/kyc-upload.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast }     from "sonner";
import { Upload, FileCheck, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Badge }  from "@/components/ui/badge";
import { cn }     from "@/lib/utils";

type Props = {
  kycStatus:    string;
  kycDocuments: string[];
};

const KYC_DOCS = [
  { id: "pan", label: "PAN Card", desc: "Clear photo of your PAN card" },
  { id: "gstin", label: "GSTIN Certificate", desc: "GST registration certificate" },
  { id: "address", label: "Address Proof", desc: "Aadhaar / Voter ID / Utility bill" },
  { id: "business",  label: "Business Proof", desc: "Shop act / Partnership deed / MOA" },
];

export const KYCUpload = ({ kycStatus, kycDocuments }: Props) => {
  const router  = useRouter();
  const [files,   setFiles]   = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!files.length) { 
      toast.error("Please select at least one document."); 
      return; 
    }
    setLoading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      const res  = await fetch("/api/upload/kyc", { method: "POST", body: fd });
      const data = await res.json() as { 
        success: boolean; 
        error?: string; 
        message?: string 
      };

      if (!data.success) { 
        toast.error(data.error ?? "Upload failed."); 
        return; 
      }
      toast.success(data.message ?? "KYC submitted!");
      router.refresh();
    } catch { toast.error("Network error."); }
    finally   { setLoading(false); }
  }

  if (kycStatus === "APPROVED") return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-5 flex items-center gap-4">
      <ShieldCheck className="size-8 text-green-600 shrink-0" />
      <div>
        <p className="font-semibold text-green-800">KYC Verified ✓</p>
        <p className="text-sm text-green-700 mt-0.5">
          Your business is verified. You appear in vendor search results.
        </p>
      </div>
    </div>
  );

  if (kycStatus === "UNDER_REVIEW") return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 flex items-center gap-4">
      <AlertCircle className="size-8 text-blue-600 shrink-0" />
      <div>
        <p className="font-semibold text-blue-800">KYC Under Review</p>
        <p className="text-sm text-blue-700 mt-0.5">
          Your documents are being reviewed. We&apos;ll notify you within 24–48 hours.
        </p>
        <p className="text-xs text-blue-600 mt-1">{kycDocuments.length} document(s) submitted</p>
      </div>
    </div>
  );

  if (kycStatus === "REJECTED") return (
    <div className="space-y-4">
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
        <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-800 text-sm">KYC Rejected</p>
          <p className="text-xs text-red-700 mt-0.5">
            Your documents were rejected. Please re-submit with clear, valid documents.
          </p>
        </div>
      </div>
      <KYCForm files={files} setFiles={setFiles} onSubmit={handleSubmit} loading={loading} />
    </div>
  );

  // PENDING state
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
        <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-800 text-sm">KYC Verification Pending</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Submit your documents to get verified and appear in search results.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {KYC_DOCS.map((doc) => (
          <div key={doc.id} className="rounded-lg border border-border p-3 space-y-1">
            <p className="text-xs font-semibold">{doc.label}</p>
            <p className="text-[10px] text-muted-foreground">{doc.desc}</p>
          </div>
        ))}
      </div>

      <KYCForm files={files} setFiles={setFiles} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}

function KYCForm({
  files, setFiles, onSubmit, loading,
}: {
  files: File[]; setFiles: (f: File[]) => void;
  onSubmit: () => void; loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <label className={cn(
        "block w-full rounded-xl border-2 border-dashed border-border p-8",
        "flex flex-col items-center justify-center gap-3 cursor-pointer text-center",
        "hover:border-primary/40 hover:bg-primary/5 transition-all",
      )}>
        <div className="size-12 rounded-full bg-muted flex items-center justify-center">
          <Upload className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Click to select documents</p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, PDF up to 10MB each
          </p>
        </div>
        <input
          type="file" accept="image/*,.pdf" multiple className="hidden"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
      </label>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Selected ({files.length})
          </p>
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-2.5">
              <FileCheck className="size-4 text-green-600 shrink-0" />
              <span className="text-xs truncate flex-1">{f.name}</span>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {(f.size / 1024 / 1024).toFixed(1)}MB
              </span>
            </div>
          ))}
        </div>
      )}

      <Button
        className="w-full" onClick={onSubmit}
        disabled={!files.length || loading}
      >
        {loading
          ? <><Loader2 className="size-4 animate-spin" /> Uploading…</>
          : <><Upload className="size-4" /> Submit KYC Documents</>
        }
      </Button>
    </div>
  );
}