// src/types/index.ts

// ─── API response wrapper ─────────────────────
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// ─── Session user shape ───────────────────────
export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: "CUSTOMER" | "VENDOR" | "ADMIN";
};

// ─── Dashboard stats (stub for Feature 1) ────
export type CustomerDashboardStats = {
  totalEvents: number;
  upcomingEvents: number;
  totalBookings: number;
  confirmedBookings: number;
};

export type VendorDashboardStats = {
  totalRevenue: number;
  pendingBookings: number;
  avgRating: number;
  thisMonthRevenue: number;
};

export type AdminDashboardStats = {
  totalVendors: number;
  pendingKYC: number;
  totalCustomers: number;
  totalBookings: number;
  totalGMV: number;
  activeDisputes: number;
};