// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import {
//   Plus, Trash2, Pencil, ChevronDown, ChevronUp,
//   Package, Tag, Loader2, ToggleLeft, ToggleRight, X, Check,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { FormField } from "@/components/ui/form-field";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { formatCurrency } from "@/lib/utils";

// type Addon = { 
//   id: string; 
//   name: string; 
//   price: number 
// };
// type Service = {
//   id: string; 
//   name: string; 
//   description: string | null;
//   basePrice: number; 
//   unit: string; 
//   isActive: boolean;
//   addons: Addon[];
// };

// const UNITS = ["per event", "per day", "per hour", "per person", "per plate", "per kg", "per unit", "per setup"];

// export default function VendorServicesPage() {
//   const router  = useRouter();
//   const [services,    setServices]    = useState<Service[]>([]);
//   const [loading,     setLoading]     = useState(true);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [expanded,    setExpanded]    = useState<string | null>(null);

//   // Add service form
//   const [newForm, setNewForm] = useState({ 
//     name: "", 
//     description: "", 
//     basePrice: "", 
//     unit: "per event" 
//   });
//   const [adding, setAdding]  = useState(false);

//   // Edit state
//   const [editId, setEditId]   = useState<string | null>(null);
//   const [editForm, setEditForm] = useState({ 
//     name: "", 
//     description: "", 
//     basePrice: "", 
//     unit: "" 
//   });
//   const [saving, setSaving] = useState(false);

//   // Addon form per service
//   const [addonForms, setAddonForms] = useState<Record<string, { name: string; price: string }>>({});
//   const [addingAddon, setAddingAddon] = useState<string | null>(null);
//   const [deletingAddon, setDeletingAddon] = useState<string | null>(null);

//   async function fetchServices() {
//     try {
//       const res  = await fetch("/api/vendors/services");
//       const data = await res.json() as { 
//         success: boolean; 
//         data?: Service[] 
//       };
//       if (data.success && data.data) setServices(data.data);
//     } catch { 
//       toast.error("Failed to load services."); 
//     }
//     finally { 
//       setLoading(false); 
//     }
//   }

//   useEffect(() => { fetchServices(); }, []);

//   async function handleAdd(e: React.FormEvent) {
//     e.preventDefault();
//     if (!newForm.name.trim() || !newForm.basePrice) { 
//       toast.error("Name and price required."); 
//       return; 
//     }
//     setAdding(true);
//     try {
//       const res  = await fetch("/api/vendors/services", {
//         method:  "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: newForm.name.trim(),
//           description: newForm.description.trim() || undefined,
//           basePrice: Number(newForm.basePrice),
//           unit: newForm.unit,
//         }),
//       });
//       const data = await res.json() as { 
//         success: boolean; 
//         data?: Service; 
//         error?: string 
//       };
//       if (!data.success) { 
//         toast.error(data.error ?? "Failed."); 
//         return; 
//       }
//       setServices((prev) => [...prev, data.data!]);
//       setNewForm({ 
//         name: "", 
//         description: "", 
//         basePrice: "", 
//         unit: "per event" 
//       });
//       setShowAddForm(false);
//       toast.success("Service added!");
//     } catch { 
//       toast.error("Network error."); 
//     }
//     finally { 
//       setAdding(false); 
//     }
//   }

//   async function handleSaveEdit(id: string) {
//     setSaving(true);
//     try {
//       const res  = await fetch(`/api/vendors/services/${id}`, {
//         method:  "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: editForm.name.trim(),
//           description: editForm.description.trim() || null,
//           basePrice: Number(editForm.basePrice),
//           unit: editForm.unit,
//         }),
//       });
//       const data = await res.json() as { success: boolean; data?: Service; error?: string };
//       if (!data.success) { toast.error(data.error ?? "Failed."); return; }
//       setServices((prev) => prev.map((s) => s.id === id ? { ...s, ...data.data! } : s));
//       setEditId(null);
//       toast.success("Service updated!");
//     } catch { toast.error("Network error."); }
//     finally   { setSaving(false); }
//   }

//   async function handleDelete(id: string) {
//     if (!confirm("Delete this service? All its addons will also be removed.")) return;
//     try {
//       const res  = await fetch(`/api/vendors/services/${id}`, { method: "DELETE" });
//       const data = await res.json() as { success: boolean; error?: string };
//       if (!data.success) { toast.error(data.error ?? "Failed."); return; }
//       setServices((prev) => prev.filter((s) => s.id !== id));
//       toast.success("Service deleted.");
//     } catch { toast.error("Network error."); }
//   }

//   async function toggleActive(id: string, current: boolean) {
//     try {
//       const res  = await fetch(`/api/vendors/services/${id}`, {
//         method:  "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body:    JSON.stringify({ isActive: !current }),
//       });
//       const data = await res.json() as { success: boolean; data?: Service; error?: string };
//       if (!data.success) { toast.error(data.error ?? "Failed."); return; }
//       setServices((prev) => prev.map((s) => s.id === id ? { ...s, isActive: !current } : s));
//     } catch { toast.error("Network error."); }
//   }

//   async function handleAddAddon(serviceId: string) {
//     const form = addonForms[serviceId];
//     if (!form?.name?.trim() || !form?.price) { toast.error("Name and price required."); return; }
//     setAddingAddon(serviceId);
//     try {
//       const res  = await fetch(`/api/vendors/services/${serviceId}/addons`, {
//         method:  "POST",
//         headers: { "Content-Type": "application/json" },
//         body:    JSON.stringify({ name: form.name.trim(), price: Number(form.price) }),
//       });
//       const data = await res.json() as { success: boolean; data?: Addon; error?: string };
//       if (!data.success) { toast.error(data.error ?? "Failed."); return; }
//       setServices((prev) => prev.map((s) =>
//         s.id === serviceId ? { ...s, addons: [...s.addons, data.data!] } : s
//       ));
//       setAddonForms((prev) => ({ ...prev, [serviceId]: { name: "", price: "" } }));
//       toast.success("Addon added!");
//     } catch { toast.error("Network error."); }
//     finally   { setAddingAddon(null); }
//   }

//   async function handleDeleteAddon(serviceId: string, addonId: string) {
//     setDeletingAddon(addonId);
//     try {
//       const res  = await fetch(`/api/vendors/services/${serviceId}/addons`, {
//         method:  "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body:    JSON.stringify({ addonId }),
//       });
//       const data = await res.json() as { success: boolean; error?: string };
//       if (!data.success) { toast.error(data.error ?? "Failed."); return; }
//       setServices((prev) => prev.map((s) =>
//         s.id === serviceId ? { ...s, addons: s.addons.filter((a) => a.id !== addonId) } : s
//       ));
//       toast.success("Addon removed.");
//     } catch { toast.error("Network error."); }
//     finally   { setDeletingAddon(null); }
//   }

//   if (loading) return (
//     <div className="flex items-center justify-center min-h-[40vh]">
//       <Loader2 className="size-8 animate-spin text-primary" />
//     </div>
//   );

//   return (
//     <div className="space-y-6 max-w-3xl">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">Services & Packages</h1>
//           <p className="text-sm text-muted-foreground mt-1">
//             {services.length} service{services.length !== 1 ? "s" : ""} · These appear on your vendor profile
//           </p>
//         </div>
//         <Button onClick={() => setShowAddForm((v) => !v)}>
//           <Plus className="size-4" /> Add Service
//         </Button>
//       </div>

//       {/* Add service form */}
//       {showAddForm && (
//         <Card className="border-primary/30">
//           <CardHeader className="pb-3">
//             <CardTitle className="text-base">New Service</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleAdd} className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <FormField label="Service name" htmlFor="sname" required>
//                   <Input id="sname" placeholder="e.g. Full Catering Package"
//                     value={newForm.name}
//                     onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))} />
//                 </FormField>
//                 <FormField label="Unit" htmlFor="sunit" required>
//                   <select id="sunit" value={newForm.unit}
//                     onChange={(e) => setNewForm((f) => ({ ...f, unit: e.target.value }))}
//                     className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
//                     {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
//                   </select>
//                 </FormField>
//               </div>

//               <FormField label="Base price (₹)" htmlFor="sprice" required>
//                 <Input id="sprice" type="number" min={1} placeholder="e.g. 50000"
//                   value={newForm.basePrice}
//                   onChange={(e) => setNewForm((f) => ({ ...f, basePrice: e.target.value }))} />
//               </FormField>

//               <FormField label="Description" htmlFor="sdesc">
//                 <textarea id="sdesc" rows={2}
//                   placeholder="What does this package include?"
//                   value={newForm.description}
//                   onChange={(e) => setNewForm((f) => ({ ...f, description: e.target.value }))}
//                   className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none placeholder:text-muted-foreground" />
//               </FormField>

//               <div className="flex gap-3">
//                 <Button type="submit" className="flex-1" loading={adding}>
//                   Add Service
//                 </Button>
//                 <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
//                   Cancel
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       )}

//       {/* Empty state */}
//       {services.length === 0 && !showAddForm && (
//         <div className="text-center py-20 space-y-4">
//           <Package className="size-12 mx-auto text-muted-foreground opacity-30" />
//           <p className="font-medium text-lg">No services yet</p>
//           <p className="text-sm text-muted-foreground max-w-sm mx-auto">
//             Add your services and packages so customers can see what you offer on your profile.
//           </p>
//           <Button onClick={() => setShowAddForm(true)}>
//             <Plus className="size-4" /> Add your first service
//           </Button>
//         </div>
//       )}

//       {/* Services list */}
//       <div className="space-y-4">
//         {services.map((service) => {
//           const isExpanded = expanded === service.id;
//           const isEditing  = editId   === service.id;
//           const addonForm  = addonForms[service.id] ?? { name: "", price: "" };

//           return (
//             <Card key={service.id} className={!service.isActive ? "opacity-60" : ""}>
//               <CardContent className="p-0">
//                 {/* Service header */}
//                 <div className="p-5 space-y-3">
//                   {isEditing ? (
//                     /* Edit form */
//                     <div className="space-y-3">
//                       <div className="grid grid-cols-2 gap-3">
//                         <FormField label="Name" htmlFor={`en-${service.id}`} required>
//                           <Input id={`en-${service.id}`} value={editForm.name}
//                             onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
//                         </FormField>
//                         <FormField label="Unit" htmlFor={`eu-${service.id}`}>
//                           <select id={`eu-${service.id}`} value={editForm.unit}
//                             onChange={(e) => setEditForm((f) => ({ ...f, unit: e.target.value }))}
//                             className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
//                             {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
//                           </select>
//                         </FormField>
//                       </div>
//                       <FormField label="Base price (₹)" htmlFor={`ep-${service.id}`}>
//                         <Input id={`ep-${service.id}`} type="number" min={1} value={editForm.basePrice}
//                           onChange={(e) => setEditForm((f) => ({ ...f, basePrice: e.target.value }))} />
//                       </FormField>
//                       <FormField label="Description" htmlFor={`ed-${service.id}`}>
//                         <textarea id={`ed-${service.id}`} rows={2} value={editForm.description}
//                           onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
//                           className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
//                       </FormField>
//                       <div className="flex gap-2">
//                         <Button size="sm" className="flex-1" onClick={() => handleSaveEdit(service.id)} loading={saving}>
//                           <Check className="size-4" /> Save
//                         </Button>
//                         <Button size="sm" variant="outline" onClick={() => setEditId(null)}>
//                           <X className="size-4" /> Cancel
//                         </Button>
//                       </div>
//                     </div>
//                   ) : (
//                     /* Display mode */
//                     <div className="flex items-start justify-between gap-4">
//                       <div className="min-w-0 flex-1 space-y-1">
//                         <div className="flex items-center gap-2 flex-wrap">
//                           <p className="font-semibold">{service.name}</p>
//                           <Badge variant={service.isActive ? "success" : "secondary"} className="text-[10px]">
//                             {service.isActive ? "Active" : "Hidden"}
//                           </Badge>
//                           {service.addons.length > 0 && (
//                             <Badge variant="outline" className="text-[10px]">
//                               {service.addons.length} addon{service.addons.length !== 1 ? "s" : ""}
//                             </Badge>
//                           )}
//                         </div>
//                         {service.description && (
//                           <p className="text-sm text-muted-foreground">{service.description}</p>
//                         )}
//                         <p className="text-lg font-bold text-primary">
//                           {formatCurrency(service.basePrice)}
//                           <span className="text-xs font-normal text-muted-foreground ml-1">{service.unit}</span>
//                         </p>
//                       </div>

//                       {/* Actions */}
//                       <div className="flex items-center gap-1 shrink-0">
//                         <button
//                           onClick={() => toggleActive(service.id, service.isActive)}
//                           className="p-1.5 rounded-md hover:bg-muted transition-colors"
//                           title={service.isActive ? "Hide from profile" : "Show on profile"}
//                         >
//                           {service.isActive
//                             ? <ToggleRight className="size-5 text-green-600" />
//                             : <ToggleLeft  className="size-5 text-muted-foreground" />
//                           }
//                         </button>
//                         <button
//                           onClick={() => {
//                             setEditId(service.id);
//                             setEditForm({
//                               name:        service.name,
//                               description: service.description ?? "",
//                               basePrice:   String(service.basePrice),
//                               unit:        service.unit,
//                             });
//                             setExpanded(service.id);
//                           }}
//                           className="p-1.5 rounded-md hover:bg-muted transition-colors"
//                         >
//                           <Pencil className="size-4 text-muted-foreground" />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(service.id)}
//                           className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
//                         >
//                           <Trash2 className="size-4 text-destructive" />
//                         </button>
//                         <button
//                           onClick={() => setExpanded(isExpanded ? null : service.id)}
//                           className="p-1.5 rounded-md hover:bg-muted transition-colors"
//                         >
//                           {isExpanded
//                             ? <ChevronUp   className="size-4 text-muted-foreground" />
//                             : <ChevronDown className="size-4 text-muted-foreground" />
//                           }
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Addons section — expandable */}
//                 {isExpanded && !isEditing && (
//                   <div className="border-t border-border px-5 py-4 space-y-4 bg-muted/20">
//                     <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
//                       <Tag className="size-3.5" /> Add-ons
//                     </p>

//                     {/* Existing addons */}
//                     {service.addons.length > 0 && (
//                       <div className="space-y-2">
//                         {service.addons.map((addon) => (
//                           <div key={addon.id}
//                             className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
//                             <div>
//                               <p className="text-sm font-medium">{addon.name}</p>
//                               <p className="text-xs text-muted-foreground">+{formatCurrency(addon.price)}</p>
//                             </div>
//                             <button
//                               onClick={() => handleDeleteAddon(service.id, addon.id)}
//                               disabled={deletingAddon === addon.id}
//                               className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
//                             >
//                               {deletingAddon === addon.id
//                                 ? <Loader2 className="size-4 animate-spin text-muted-foreground" />
//                                 : <X className="size-4 text-destructive" />
//                               }
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     {/* Add addon form */}
//                     <div className="flex gap-2 items-end">
//                       <FormField label="Addon name" htmlFor={`an-${service.id}`} className="flex-1">
//                         <Input id={`an-${service.id}`} placeholder="e.g. Live counter"
//                           value={addonForm.name}
//                           onChange={(e) => setAddonForms((prev) => ({
//                             ...prev,
//                             [service.id]: { ...addonForm, name: e.target.value },
//                           }))} />
//                       </FormField>
//                       <FormField label="Price (₹)" htmlFor={`ap-${service.id}`} className="w-28">
//                         <Input id={`ap-${service.id}`} type="number" min={0} placeholder="0"
//                           value={addonForm.price}
//                           onChange={(e) => setAddonForms((prev) => ({
//                             ...prev,
//                             [service.id]: { ...addonForm, price: e.target.value },
//                           }))} />
//                       </FormField>
//                       <Button size="sm" className="mb-0.5"
//                         onClick={() => handleAddAddon(service.id)}
//                         loading={addingAddon === service.id}
//                         disabled={!addonForm.name || !addonForm.price}
//                       >
//                         <Plus className="size-4" /> Add
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// app/(dashboard)/vendor/services/page.tsx
"use client";

import { Plus, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useServices } from "./_hooks/use-services";
import { AddServiceForm } from "./_components/add-service-form";
import { ServiceCard } from "./_components/service-card";

export default function VendorServicesPage() {
  const {
    services, loading, showAddForm, setShowAddForm,
    expanded, setExpanded,
    newForm, setNewForm, adding,
    editId, setEditId, editForm, setEditForm, saving,
    addonForms, addingAddon, deletingAddon,
    handleAdd, startEdit, handleSaveEdit, handleDelete,
    toggleActive, setAddonField, handleAddAddon, handleDeleteAddon,
  } = useServices();

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services & Packages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {services.length} service{services.length !== 1 ? "s" : ""} · These appear on your vendor profile
          </p>
        </div>
        <Button onClick={() => setShowAddForm((v) => !v)}>
          <Plus className="size-4" /> Add Service
        </Button>
      </div>

      {showAddForm && (
        <AddServiceForm
          form={newForm}
          adding={adding}
          onChange={(field, value) => setNewForm((f) => ({ ...f, [field]: value }))}
          onSubmit={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {services.length === 0 && !showAddForm && (
        <div className="text-center py-20 space-y-4">
          <Package className="size-12 mx-auto text-muted-foreground opacity-30" />
          <p className="font-medium text-lg">No services yet</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Add your services and packages so customers can see what you offer on your profile.
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="size-4" /> Add your first service
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isExpanded={expanded === service.id}
            isEditing={editId === service.id}
            editForm={editForm}
            addonForm={addonForms[service.id] ?? { name: "", price: "" }}
            saving={saving}
            addingAddon={addingAddon}
            deletingAddon={deletingAddon}
            onToggleExpand={() => setExpanded(expanded === service.id ? null : service.id)}
            onStartEdit={() => startEdit(service)}
            onCancelEdit={() => setEditId(null)}
            onEditChange={(field, value) => setEditForm((f) => ({ ...f, [field]: value }))}
            onSaveEdit={() => handleSaveEdit(service.id)}
            onDelete={() => handleDelete(service.id)}
            onToggleActive={() => toggleActive(service.id, service.isActive)}
            onAddonFieldChange={(field, value) => setAddonField(service.id, field, value)}
            onAddAddon={() => handleAddAddon(service.id)}
            onDeleteAddon={(addonId) => handleDeleteAddon(service.id, addonId)}
          />
        ))}
      </div>
    </div>
  );
}