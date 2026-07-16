
export const UNITS = [
  "per event", 
  "per day", 
  "per hour", 
  "per person",
  "per plate", 
  "per kg", 
  "per unit", 
  "per setup",
];

export const SELECT_CLS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const TEXTAREA_CLS =
  "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none placeholder:text-muted-foreground";

export const INITIAL_NEW_FORM = {
  name: "", 
  description: "", 
  basePrice: "", 
  unit: "per event",
};