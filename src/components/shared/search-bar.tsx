
// URL-driven search input with 400ms debounce

"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  className?:   string;
}

export function SearchBar({
  placeholder = "Search vendors, categories, cities…",
  className,
}: SearchBarProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const timer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Read value directly from URL — no local state needed.
  // The input is "uncontrolled" but initialised from URL via defaultValue.
  // We use a key derived from the URL so React re-mounts the input
  // when the URL q param changes externally (back button, chip click).
  const urlQ = params.get("q") ?? "";

  function handleChange(v: string) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (v.trim()) next.set("q", v.trim());
      else          next.delete("q");
      next.delete("page");
      router.push(`${pathname}?${next.toString()}`);
    }, 400);
  }

  function clear() {
    if (inputRef.current) inputRef.current.value = "";
    const next = new URLSearchParams(params.toString());
    next.delete("q");
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <input
        key={urlQ}             // re-mounts input when URL changes externally
        ref={inputRef}
        type="search"
        defaultValue={urlQ}    // uncontrolled — avoids controlled/effect pattern
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 rounded-xl border border-input bg-background pl-10 pr-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground"
      />
      {urlQ && (
        <button
          onClick={clear}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}