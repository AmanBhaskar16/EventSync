
import type { VendorProfile } from "../_queries";

export const PortfolioSection = ({ images }: { images: VendorProfile["portfolioImages"] }) => {
  if (images.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">Portfolio</h2>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-64 rounded-xl overflow-hidden">
        {images.slice(0, 5).map((src, i) => (
          <div key={src} className={i === 0 ? "col-span-2 row-span-2 relative overflow-hidden" : "relative overflow-hidden"}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Portfolio ${i + 1}`}
              className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
            />
            {i === 4 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-lg">+{images.length - 5}</span>
              </div>
            )}
          </div>
        ))}
        {Array.from({ length: Math.max(0, 4 - images.slice(1, 5).length) }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-muted" />
        ))}
      </div>
    </section>
  );
}