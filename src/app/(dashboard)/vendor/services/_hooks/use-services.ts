
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { INITIAL_NEW_FORM } from "../_constants";
import type { Service, NewServiceForm, EditServiceForm, AddonForm } from "../_types";

export function useServices() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [expanded, setExpanded] = useState<string | null>(null);

    // Add form
    const [newForm, setNewForm]  = useState<NewServiceForm>(INITIAL_NEW_FORM);
    const [adding, setAdding]   = useState(false);

    // Edit state
    const [editId, setEditId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<EditServiceForm>({ 
        name: "", 
        description: "", 
        basePrice: "", 
        unit: "" 
    });
    const [saving, setSaving] = useState(false);

    // Addon state
    const [addonForms, setAddonForms] = useState<Record<string, AddonForm>>({});
    const [addingAddon, setAddingAddon] = useState<string | null>(null);
    const [deletingAddon, setDeletingAddon] = useState<string | null>(null);

    // ── Fetch ──────────────────────────────────────────────────────────────────

    async function fetchServices() {
      try {
        const res  = await fetch("/api/vendors/services");
        const data = await res.json() as { 
            success: boolean; 
            data?: Service[] 
        };
        if (data.success && data.data) setServices(data.data);
      } catch {
        toast.error("Failed to load services.");
      } finally {
        setLoading(false);
      }
    }

    useEffect(() => { fetchServices(); }, []);

    // ── Add service ────────────────────────────────────────────────────────────

    async function handleAdd(e: React.FormEvent) {
      e.preventDefault();
      if (!newForm.name.trim() || !newForm.basePrice) {
        toast.error("Name and price required."); 
        return;
      }
      setAdding(true);
      try {
        const res  = await fetch("/api/vendors/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newForm.name.trim(),
            description: newForm.description.trim() || undefined,
            basePrice: Number(newForm.basePrice),
            unit: newForm.unit,
          }),
        });
        const data = await res.json() as { 
            success: boolean; 
            data?: Service; 
            error?: string 
        };
        if (!data.success) { 
            toast.error(data.error ?? "Failed."); 
            return; 
        }
        setServices((prev) => [...prev, data.data!]);
        setNewForm(INITIAL_NEW_FORM);
        setShowAddForm(false);
        toast.success("Service added!");
      } catch {
        toast.error("Network error.");
      } finally {
        setAdding(false);
      }
    }

  // ── Edit service ───────────────────────────────────────────────────────────

  function startEdit(service: Service) {
    setEditId(service.id);
    setEditForm({
      name: service.name,
      description: service.description ?? "",
      basePrice: String(service.basePrice),
      unit: service.unit,
    });
    setExpanded(service.id);
  }

  async function handleSaveEdit(id: string) {
        setSaving(true);
        try {
          const res  = await fetch(`/api/vendors/services/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: editForm.name.trim(),
              description: editForm.description.trim() || null,
              basePrice: Number(editForm.basePrice),
              unit: editForm.unit,
            }),
        });
        const data = await res.json() as { 
            success: boolean; 
            data?: Service; 
            error?: string 
        };
        if (!data.success) { 
            toast.error(data.error ?? "Failed."); 
            return; 
        }
        setServices((prev) => prev.map((s) => s.id === id ? { ...s, ...data.data! } : s));
        setEditId(null);
        toast.success("Service updated!");
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete service ─────────────────────────────────────────────────────────

    async function handleDelete(id: string) {
      if (!confirm("Delete this service? All its addons will also be removed.")) return;
      try {
        const res  = await fetch(`/api/vendors/services/${id}`, { method: "DELETE" });
        const data = await res.json() as { 
            success: boolean; 
            error?: string 
        };
        if (!data.success) { 
            toast.error(data.error ?? "Failed."); 
            return; 
        }
        setServices((prev) => prev.filter((s) => s.id !== id));
        toast.success("Service deleted.");
      } catch {
        toast.error("Network error.");
      }
    }

  // ── Toggle active ──────────────────────────────────────────────────────────

    async function toggleActive(id: string, current: boolean) {
      try {
        const res  = await fetch(`/api/vendors/services/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !current }),
        });
        const data = await res.json() as { 
            success: boolean; 
            data?: Service; 
            error?: string 
        };
        if (!data.success) { 
            toast.error(data.error ?? "Failed."); 
            return; 
        }
        setServices((prev) => prev.map((s) => s.id === id ? { ...s, isActive: !current } : s));
      } catch {
        toast.error("Network error.");
      }
    }

  // ── Addons ─────────────────────────────────────────────────────────────────

    function setAddonField(serviceId: string, field: keyof AddonForm, value: string) {
      setAddonForms((prev) => ({
        ...prev,
        [serviceId]: { ...(prev[serviceId] ?? { name: "", price: "" }), [field]: value },
      }));
    }

    async function handleAddAddon(serviceId: string) {
        const form = addonForms[serviceId];
        if (!form?.name?.trim() || !form?.price) { 
          toast.error("Name and price required."); 
          return; 
        }
        setAddingAddon(serviceId);
        try {
          const res  = await fetch(`/api/vendors/services/${serviceId}/addons`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                name: form.name.trim(), 
                price: Number(form.price) 
            }),
          });
          const data = await res.json() as { 
                success: boolean; 
                data?: { 
                    id: string; 
                    name: string; 
                    price: number 
                }; 
                error?: string 
            };
            if (!data.success) { 
                toast.error(data.error ?? "Failed."); 
                return; 
            }
            setServices((prev) => prev.map((s) =>
              s.id === serviceId ? { ...s, addons: [...s.addons, data.data!] } : s
            ));
            setAddonForms((prev) => ({ ...prev, [serviceId]: { name: "", price: "" } }));
            toast.success("Addon added!");
        } catch {
          toast.error("Network error.");
        } finally {
          setAddingAddon(null);
        }
    }   

    async function handleDeleteAddon(serviceId: string, addonId: string) {
      setDeletingAddon(addonId);
      try {
        const res  = await fetch(`/api/vendors/services/${serviceId}/addons`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ addonId }),
        });
        const data = await res.json() as { 
            success: boolean; 
            error?: string 
        };
        if (!data.success) { 
            toast.error(data.error ?? "Failed."); 
            return; 
        }
        setServices((prev) => prev.map((s) =>
          s.id === serviceId ? { ...s, addons: s.addons.filter((a) => a.id !== addonId) } : s
        ));
        toast.success("Addon removed.");
      } catch {
        toast.error("Network error.");
      } finally {
        setDeletingAddon(null);
      }
    }

  return {
    // state
    services, 
    loading, 
    showAddForm, 
    setShowAddForm,
    expanded, 
    setExpanded,
    newForm, 
    setNewForm, 
    adding,
    editId, 
    setEditId, 
    editForm, 
    setEditForm, 
    saving,
    addonForms, 
    addingAddon, 
    deletingAddon,
    // handlers
    handleAdd, 
    startEdit, 
    handleSaveEdit, 
    handleDelete, 
    toggleActive,
    setAddonField, 
    handleAddAddon, 
    handleDeleteAddon,
  };
}