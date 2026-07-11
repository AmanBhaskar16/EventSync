
// cn() — Tailwind class merger (used everywhere)
// formatCurrency / formatDate — used in dashboards

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {format} from "date-fns";

// ─── Tailwind class merger ────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency ────────────────────────────────

export function formatCurrency(
  amount: number,
  currency = "INR",
  locale   = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    style:                "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Dates ───────────────────────────────────

export function formatDate(date: Date | string, fmt = "dd MMM yyyy"): string {
  return format(new Date(date), fmt);
}

// ─── Greeting ────────────────────────────────

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

// ─── Labels used in dashboard cards ──────────

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  INQUIRY:     "Inquiry",
  QUOTE_SENT:  "Quote Sent",
  NEGOTIATION: "Negotiation",
  CONFIRMED:   "Confirmed",
  IN_PROGRESS: "In Progress",
  COMPLETED:   "Completed",
  CANCELLED:   "Cancelled",
  DISPUTED:    "Disputed",
};

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  INQUIRY:     "bg-blue-50 text-blue-700 border-blue-200",
  QUOTE_SENT:  "bg-purple-50 text-purple-700 border-purple-200",
  NEGOTIATION: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED:   "bg-green-50 text-green-700 border-green-200",
  IN_PROGRESS: "bg-cyan-50 text-cyan-700 border-cyan-200",
  COMPLETED:   "bg-gray-50 text-gray-700 border-gray-200",
  CANCELLED:   "bg-red-50 text-red-700 border-red-200",
  DISPUTED:    "bg-orange-50 text-orange-700 border-orange-200",
};

export const VENDOR_CATEGORY_LABELS: Record<string, string> = {
  CATERING:          "Catering",
  DECOR:             "Decor",
  PHOTOGRAPHY:       "Photography",
  VIDEOGRAPHY:       "Videography",
  VENUE:             "Venue",
  ENTERTAINMENT:     "Entertainment",
  DJ_MUSIC:          "DJ & Music",
  TRANSPORTATION:    "Transportation",
  FLORALS:           "Florals",
  MAKEUP_ARTIST:     "Makeup Artist",
  MEHENDI:           "Mehendi",
  SOUND_LIGHTING:    "Sound & Lighting",
  INVITATION_DESIGN: "Invitation Design",
  CAKE_BAKERY:       "Cake & Bakery",
  SECURITY:          "Security",
  ANCHOR_HOST:       "Anchor & Host",
  OTHER:             "Other",
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  WEDDING:        "Wedding",
  BIRTHDAY:       "Birthday",
  BACHELORETTE:   "Bachelorette",
  BACHELOR:       "Bachelor Party",
  ANNIVERSARY:    "Anniversary",
  CORPORATE:      "Corporate",
  KITTY_PARTY:    "Kitty Party",
  REUNION:        "Reunion",
  BABY_SHOWER:    "Baby Shower",
  ENGAGEMENT:     "Engagement",
  COCKTAIL_PARTY: "Cocktail Party",
  OTHER:          "Other",
};