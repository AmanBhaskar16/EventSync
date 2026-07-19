
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Loader2 }  from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { url } from "inspector/promises";

type Props = {
  currentAvatar: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
};

const SIZE_MAP = {
  sm:  { outer: "size-16", text: "text-xl",  icon: "size-4" },
  md:  { outer: "size-24", text: "text-3xl", icon: "size-5" },
  lg:  { outer: "size-32", text: "text-4xl", icon: "size-6" },
};

export const AvatarUpload = ({ currentAvatar, name, size = "md" }: Props) => {
  const router   = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview]  = useState<string | null>(currentAvatar);
  const [loading, setLoading]  = useState(false);
  const s = SIZE_MAP[size];
  const { update } = useSession();
  const initials = (name ?? "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/upload/avatar", { method: "POST", body: fd });
      const data = await res.json() as { 
        success: boolean; 
        data?: { url: string }; 
        error?: string 
      };
      if (!data.success) {
        toast.error(data.error ?? "Upload failed.");
        setPreview(currentAvatar);
        return;
      }
      toast.success("Profile photo updated!");
      await update({ avatar: url });
      router.refresh();
    } catch {
      toast.error("Network error.");
      setPreview(currentAvatar);
    } finally { setLoading(false); }
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className={cn(
          "relative rounded-full overflow-hidden bg-primary/10 flex items-center justify-center",
          "border-2 border-transparent hover:border-primary/40 transition-all group",
          s.outer
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className={cn("font-bold text-primary", s.text)}>{initials}</span>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {loading
            ? <Loader2 className={cn("animate-spin text-white", s.icon)} />
            : <Camera  className={cn("text-white", s.icon)} />
          }
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* Camera badge */}
      <div className="absolute bottom-0 right-0 size-6 rounded-full bg-primary flex items-center justify-center border-2 border-background pointer-events-none">
        <Camera className="size-3 text-primary-foreground" />
      </div>
    </div>
  );
}