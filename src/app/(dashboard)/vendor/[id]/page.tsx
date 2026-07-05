
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { VENDOR_CATEGORY_LABELS } from "@/lib/utils";
import { getVendorProfile, computeAvgDimensions } from "./_queries";
import { VendorProfileHeader } from "./_components/vendor-profile-header";
import { PortfolioSection } from "./_components/portfolio-section";
import { ServicesSection } from "./_components/services-section";
import { ReviewsSection } from "./_components/reviews-section";
import { BookingSidebar } from "./_components/booking-sidebar";

export const generateMetadata = async ({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> => {
  const { id } = await params;
  const vendor = await getVendorProfile(id);
  if (!vendor) return { 
    title: "Vendor Not Found" 
  };
  return {
    title: `${vendor.businessName} | EventSync`,
    description: vendor.description ?? `${VENDOR_CATEGORY_LABELS[vendor.category]} in ${vendor.city}`,
  };
}

const VendorProfilePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const vendor = await getVendorProfile(id);
  if (!vendor) notFound();

  const minPrice = vendor.services[0]?.basePrice ?? 0;
  const avgDimensions = computeAvgDimensions(vendor.reviews);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-16 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-12 flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/vendors"><ArrowLeft className="size-4" /> All vendors</Link>
          </Button>
          <span className="text-muted-foreground text-sm hidden sm:block">/</span>
          <span className="text-sm font-medium hidden sm:block truncate">{vendor.businessName}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
          <div className="space-y-8">
            <VendorProfileHeader vendor={vendor} />
            <PortfolioSection images={vendor.portfolioImages} />
            <ServicesSection services={vendor.services} />
            <ReviewsSection
              reviews={vendor.reviews}
              totalReviews={vendor.totalReviews}
              avgRating={vendor.avgRating}
              avgDimensions={avgDimensions}
            />
          </div>
          <BookingSidebar vendor={vendor} minPrice={minPrice} />
        </div>
      </div>
    </div>
  );
}

export default VendorProfilePage;