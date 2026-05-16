import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

export function FormField({
  label,
  required,
  error,
  hint,
  className,
  children,
  htmlFor,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <svg className="size-3 shrink-0" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm0 4a.75.75 0 01.75.75v2a.75.75 0 01-1.5 0v-2A.75.75 0 016 5zm0-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}