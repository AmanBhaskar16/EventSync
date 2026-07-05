
import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "../_queries";

export const ServicesSection = ({ services }: { services: Service[] }) => {
  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold flex items-center gap-2">
        <Package className="size-4 text-muted-foreground" /> Services & Packages
      </h2>
      {services.length === 0 ? (
        <p className="text-sm text-muted-foreground">No services listed yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {services.map((service) => (
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
                {service.serviceAddons.length > 0 && (
                  <div className="border-t border-border pt-3 space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Add-ons</p>
                    {service.serviceAddons.map((addon) => (
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
  );
}