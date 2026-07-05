
export type Addon = { id: string; name: string; price: number };

export type Service = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  unit: string;
  serviceAddons: Addon[];
};

export type Review = {
  id: string;
  reviewerName: string;
  overallRating: number;
  comment: string | null;
  vendorReply: string | null;
  createdAt: string;
  punctuality: number;
  quality: number;
  communication: number;
  value: number;
  professionalism: number;
};

export type VendorProfile = {
  id: string;
  businessName: string;
  category: string;
  description: string | null;
  city: string;
  state: string;
  pincode: string;
  serviceRadius: number;
  isVerified: boolean;
  avgRating: number;
  totalReviews: number;
  totalBookings: number;
  responseTime: number;
  tier: string;
  portfolioImages: string[];
  createdAt: string;
  user: { name: string | null; avatar: string | null };
  services: Service[];
  reviews: Review[];
};

export type AvgDimensions = {
  punctuality: number;
  quality: number;
  communication: number;
  value: number;
  professionalism: number;
};

export const getVendorProfile = async (id: string): Promise<VendorProfile | null> => {
  try {
    const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/vendors/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json() as { 
      success: boolean; 
      data?: VendorProfile 
    };
    return data.success ? (data.data ?? null) : null;
  } catch {
    return null;
  }
}

export const computeAvgDimensions = (reviews: Review[]): AvgDimensions | null => {
  if (reviews.length === 0) return null;
  const count = reviews.length;
  return {
    punctuality: reviews.reduce((s, r) => s + r.punctuality,0)/count,
    quality: reviews.reduce((s, r) => s + r.quality,0)/count,
    communication: reviews.reduce((s, r) => s + r.communication,0)/count,
    value: reviews.reduce((s, r) => s + r.value,0)/count,
    professionalism: reviews.reduce((s, r) => s + r.professionalism,0)/count,
  };
}