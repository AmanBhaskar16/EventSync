
// Full vendor profile — portfolio, services, reviews, booking CTA

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Clock, CheckCircle, Star, Calendar, Users,
  ArrowLeft, MessageSquare, Package, BadgeCheck, Banknote, Phone,
} from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { StarRating } from "@/components/shared/star-rating";
import { BookingRequestButton } from "@/components/vendors/booking-request-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, VENDOR_CATEGORY_LABELS } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/format";

// ── Types ─────────────────────────────────────────────────────────────────────

type Addon   = { 
  id: string; 
  name: string; 
  price: number 
};
type Service = { 
  id: string; 
  name: string; 
  description: string | null; 
  basePrice: number; 
  unit: string; 
  addons: Addon[] 
};
type Review  = {
  id: string; 
  reviewerName: string; 
  overallRating: number; 
  comment: string | null;
  vendorReply: string | null; 
  createdAt: Date;
  punctuality: number; 
  quality: number; 
  communication: number; 
  value: number; 
  professionalism: number;
};
type VendorProfile = {
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
  createdAt: Date;
  user:     { 
    name: string | null; 
    avatar: string | null; 
    createdAt: Date 
  };
  services: Service[];
  reviews:  Review[];
};

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getVendor(id: string): Promise<VendorProfile | null> {
  try {
    const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res  = await fetch(`${base}/api/vendors/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json() as { 
      success: boolean; 
      data?: VendorProfile 
    };
    return data.success ? data.data ?? null : null;
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id }  = await params;
  const vendor  = await getVendor(id);
  if (!vendor)  return { 
    title: "Vendor Not Found" 
  };
  return {
    title:  `${vendor.businessName} | EventSync`,
    description: vendor.description ?? `${VENDOR_CATEGORY_LABELS[vendor.category]} in ${vendor.city}`,
  };
}

// ── Rating breakdown bar ──────────────────────────────────────────────────────
function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-32 text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
      <span className="text-xs font-medium w-6 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function VendorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await getVendor(id);
  if (!vendor) notFound();

  const minPrice = vendor.services[0]?.basePrice ?? 0;

  const avgDimensions = vendor.reviews.length > 0 ? {
    punctuality:     vendor.reviews.reduce((s, r) => s + r.punctuality,     0) / vendor.reviews.length,
    quality:         vendor.reviews.reduce((s, r) => s + r.quality,         0) / vendor.reviews.length,
    communication:   vendor.reviews.reduce((s, r) => s + r.communication,   0) / vendor.reviews.length,
    value:           vendor.reviews.reduce((s, r) => s + r.value,           0) / vendor.reviews.length,
    professionalism: vendor.reviews.reduce((s, r) => s + r.professionalism, 0) / vendor.reviews.length,
  } : null;

  const AVATAR_COLORS = [
    "bg-primary/15 text-primary", "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700", "bg-amber-100 text-amber-700",
    "bg-purple-100 text-purple-700",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb */}
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

          {/* ── Left column ── */}
          <div className="space-y-8">

            {/* Profile header */}
            <div className="space-y-4">
              <div className="flex items-start gap-5">
                <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary border border-primary/20 shrink-0">
                  {vendor.businessName.charAt(0)}
                </div>
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">{vendor.businessName}</h1>
                    {vendor.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        <BadgeCheck className="size-3.5" /> Verified
                      </span>
                    )}
                    {vendor.tier === "ELITE" && <Badge variant="warning" className="text-xs">Elite</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span className="inline-flex items-center text-sm font-medium rounded-full border border-border bg-muted/50 px-2.5 py-0.5">
                      {VENDOR_CATEGORY_LABELS[vendor.category] ?? vendor.category}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" />{vendor.city}, {vendor.state}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="size-3.5" />Responds in {vendor.responseTime}h
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-5">
                    {vendor.avgRating > 0 && (
                      <div className="flex items-center gap-2">
                        <StarRating rating={vendor.avgRating} size="md" />
                        <span className="text-xs text-muted-foreground">({vendor.totalReviews} review{vendor.totalReviews !== 1 ? "s" : ""})</span>
                      </div>
                    )}
                    {vendor.totalBookings > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="size-4" />{vendor.totalBookings} events completed
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="size-4" />On EventSync since {formatDate(vendor.createdAt, "MMM yyyy")}
                    </div>
                  </div>
                </div>
              </div>
              {vendor.description && (
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{vendor.description}</p>
              )}
            </div>

            {/* Portfolio */}
            {vendor.portfolioImages.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-base font-semibold">Portfolio</h2>
                <div className="grid grid-cols-4 grid-rows-2 gap-2 h-64 rounded-xl overflow-hidden">
                  {vendor.portfolioImages.slice(0, 5).map((src, i) => (
                    <div key={src} className={i === 0 ? "col-span-2 row-span-2 relative overflow-hidden" : "relative overflow-hidden"}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`${vendor.businessName} portfolio ${i + 1}`}
                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" />
                      {i === 4 && vendor.portfolioImages.length > 5 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">+{vendor.portfolioImages.length - 5}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 4 - vendor.portfolioImages.slice(1).length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-muted" />
                  ))}
                </div>
              </section>
            )}

            {/* Services */}
            <section className="space-y-4">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Package className="size-4 text-muted-foreground" /> Services & Packages
              </h2>
              {vendor.services.length === 0 ? (
                <p className="text-sm text-muted-foreground">No services listed yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {vendor.services.map((service) => (
                    <Card key={service.id} className="hover:border-primary/30 transition-colors">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm">{service.name}</h3>
                            {service.description && (
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{service.description}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-base font-bold">{formatCurrency(service.basePrice)}</p>
                            <p className="text-[10px] text-muted-foreground">{service.unit}</p>
                          </div>
                        </div>
                        {service.addons.length > 0 && (
                          <div className="border-t border-border pt-3 space-y-1.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Add-ons</p>
                            {service.addons.map((addon) => (
                              <div key={addon.id} className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{addon.name}</span>
                                <span className="font-medium">+{formatCurrency(addon.price)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Reviews */}
            <section className="space-y-4">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <MessageSquare className="size-4 text-muted-foreground" />
                Reviews {vendor.totalReviews > 0 && <span className="text-muted-foreground font-normal">({vendor.totalReviews})</span>}
              </h2>

              {avgDimensions && (
                <Card>
                  <CardContent className="p-5">
                    <div className="flex gap-8 flex-wrap">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold">{vendor.avgRating.toFixed(1)}</span>
                        <StarRating rating={vendor.avgRating} showValue={false} size="sm" />
                        <span className="text-xs text-muted-foreground mt-1">{vendor.totalReviews} review{vendor.totalReviews !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex-1 min-w-50 space-y-2">
                        <RatingBar label="Punctuality"     value={avgDimensions.punctuality} />
                        <RatingBar label="Quality"         value={avgDimensions.quality} />
                        <RatingBar label="Communication"   value={avgDimensions.communication} />
                        <RatingBar label="Value for money" value={avgDimensions.value} />
                        <RatingBar label="Professionalism" value={avgDimensions.professionalism} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {vendor.reviews.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground space-y-2">
                  <MessageSquare className="size-8 mx-auto opacity-30" />
                  <p className="text-sm">No reviews yet. Be the first to book and review!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vendor.reviews.map((review) => {
                    const colorIdx = review.reviewerName.charCodeAt(0) % AVATAR_COLORS.length;
                    return (
                      <div key={review.id} className="rounded-xl border border-border p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`size-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${AVATAR_COLORS[colorIdx]}`}>
                              {review.reviewerName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{review.reviewerName}</p>
                              <p className="text-xs text-muted-foreground">{formatRelativeTime(review.createdAt)}</p>
                            </div>
                          </div>
                          <StarRating rating={review.overallRating} size="sm" />
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                        )}
                        <div className="grid grid-cols-5 gap-2 text-center">
                          {[
                            { label: "Punctuality",    val: review.punctuality    },
                            { label: "Quality",        val: review.quality        },
                            { label: "Communication",  val: review.communication  },
                            { label: "Value",          val: review.value          },
                            { label: "Professional",   val: review.professionalism },
                          ].map(({ label, val }) => (
                            <div key={label}>
                              <div className="text-[10px] text-muted-foreground">{label}</div>
                              <div className="text-xs font-bold">{val}/5</div>
                            </div>
                          ))}
                        </div>
                        {review.vendorReply && (
                          <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-1">
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Vendor replied</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{review.vendorReply}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* ── Right column — sticky booking card ── */}
          <div className="lg:sticky lg:top-28 space-y-4">
            <Card className="shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Book this vendor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {minPrice > 0 && (
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{formatCurrency(minPrice)}</span>
                    <span className="text-sm text-muted-foreground">/ {vendor.services[0]?.unit}</span>
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  {[
                    { icon: CheckCircle, text: "KYC verified business" },
                    { icon: Banknote,    text: "Secure milestone payments" },
                    { icon: Star,        text: "Dispute protection" },
                    { icon: Clock,       text: `Responds within ${vendor.responseTime} hours` },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-muted-foreground">
                      <Icon className="size-4 shrink-0 text-green-600" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
                <BookingRequestButton vendorId={vendor.id} vendorName={vendor.businessName} />
                <p className="text-[11px] text-muted-foreground text-center">No payment required to send an inquiry</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="size-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Phone className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold">Questions?</p>
                  <p className="text-xs text-muted-foreground">Send an inquiry and chat directly with the vendor.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-semibold">Service area</p>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 mt-0.5 shrink-0" />
                  <span>{vendor.city}, {vendor.state} — within {vendor.serviceRadius} km</span>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}