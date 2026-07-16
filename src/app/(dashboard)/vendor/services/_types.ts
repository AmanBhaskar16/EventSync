
export type Addon = {
  id: string;
  name: string;
  price: number;
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  unit: string;
  isActive: boolean;
  addons: Addon[];
};

export type NewServiceForm = {
  name: string;
  description: string;
  basePrice: string;
  unit: string;
};

export type EditServiceForm = {
  name: string;
  description: string;
  basePrice: string;
  unit: string;
};

export type AddonForm = {
  name: string;
  price: string;
};