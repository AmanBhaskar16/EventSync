// src/components/upload/portfolio-upload.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast }     from "sonner";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
// import { Button } from "@/components/ui/button";
import { cn }     from "@/lib/utils";

type Props = {
  currentImages: string[];
  vendorName:    string;
};

export const PortfolioUpload = ({ currentImages, vendorName }: Props) => {
  const router   = useRouter();
  const [images,  setImages]  = useState<string[]>(currentImages);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    if (images.length >= 8) {
      toast.error("Maximum 8 portfolio images allowed."); return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      const res  = await fetch("/api/upload/portfolio", { method: "POST", body: fd });
      const data = await res.json() as {
        success: boolean; 
        data?: { portfolioImages: string[] }; 
        error?: string;
      };
      if (!data.success) { 
        toast.error(data.error ?? "Upload failed."); 
        return; 
      }
      setImages(data.data!.portfolioImages);
      toast.success("Images uploaded!");
      router.refresh();
    } catch { 
      toast.error("Network error."); 
    }
    finally { 
      setLoading(false); 
      e.target.value = ""; 
    }
  }

  async function handleDelete(imageUrl: string) {
    setDeleting(imageUrl);
    try {
      const res  = await fetch("/api/upload/portfolio", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ imageUrl }),
      });
      const data = await res.json() as {
        success: boolean; 
        data?: { portfolioImages: string[] }; 
        error?: string;
      };
      if (!data.success) { 
        toast.error(data.error ?? "Failed to remove."); 
        return; 
      }
      setImages(data.data!.portfolioImages);
      toast.success("Image removed.");
      router.refresh();
    } catch {
      toast.error("Network error."); 
    }
    finally { 
      setDeleting(null); 
    }
  }

  return (
    <div className="space-y-4">
      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((src, i) => (
            <div key={src} className="relative group aspect-video rounded-xl overflow-hidden bg-muted border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${vendorName} portfolio ${i + 1}`}
                className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(src)}
                  disabled={!!deleting}
                  className="size-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                >
                  {deleting === src
                    ? <Loader2 className="size-4 text-white animate-spin" />
                    : <X className="size-4 text-white" />
                  }
                </button>
              </div>
              <div className="absolute top-1.5 left-1.5 size-5 rounded-full bg-black/50 flex items-center justify-center">
                <span className="text-[9px] text-white font-bold">{i + 1}</span>
              </div>
            </div>
          ))}

          {/* Add more slot */}
          {images.length < 8 && (
            <label className={cn(
              "aspect-video rounded-xl border-2 border-dashed border-border",
              "flex flex-col items-center justify-center gap-1 cursor-pointer",
              "hover:border-primary/40 hover:bg-primary/5 transition-all",
              loading ? "opacity-50 pointer-events-none" : ""
            )}>
              {loading
                ? <Loader2 className="size-5 animate-spin text-primary" />
                : <>
                    <ImagePlus className="size-5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Add photo</span>
                  </>
              }
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
            </label>
          )}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && (
        <label className={cn(
          "block w-full rounded-xl border-2 border-dashed border-border p-10",
          "flex flex-col items-center justify-center gap-3 cursor-pointer text-center",
          "hover:border-primary/40 hover:bg-primary/5 transition-all",
          loading ? "opacity-50 pointer-events-none" : ""
        )}>
          {loading ? (
            <Loader2 className="size-8 animate-spin text-primary" />
          ) : (
            <>
              <div className="size-14 rounded-full bg-muted flex items-center justify-center">
                <Upload className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Upload portfolio photos</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WEBP up to 10MB each · Max 8 photos
                </p>
              </div>
            </>
          )}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
        </label>
      )}

      <p className="text-xs text-muted-foreground">
        {images.length}/8 photos uploaded
        {images.length > 0 && " · Hover over image to remove"}
      </p>
    </div>
  );
}