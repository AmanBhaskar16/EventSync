
export type UserData = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  vendor?: {
    businessName: string; 
    category: string; 
    description: string | null;
    city: string; 
    state: string; 
    pincode: string; 
    serviceRadius: number;
    gstin: string | null; 
    pan: string | null;
    bankName: string | null; 
    bankAccountNo: string | null; 
    bankIfsc: string | null;
    kycStatus: string; 
    isVerified: boolean;
    avgRating: number; 
    totalReviews: number; 
    totalBookings: number;
  } | null;
  customer?: {
    address: string | null; 
    city: string | null;
    state: string | null; 
    pincode: string | null;
  } | null;
};

export type SaveFn = (section: string, data: Record<string, unknown>) => Promise<void>;