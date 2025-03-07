export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  category: string;
  price: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  menu_allergens?: {
    id: string;
    allergen_id: string;
    severity: 'Low' | 'Medium' | 'High';
    notes: string | null;
    allergens: {
      id: string;
      name: string;
      description: string | null;
    };
  }[];
}

export interface MenuAllergen {
  id: string;
  menu_item_id: string;
  allergen_id: string;
  severity: 'Low' | 'Medium' | 'High';
  notes: string | null;
  allergens?: {
    id: string;
    name: string;
    description: string | null;
  };
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string | null;
}

export interface ImportedMenuItem {
  name: string;
  description?: string;
  category?: string;
  price?: string;
  allergens?: string;
}