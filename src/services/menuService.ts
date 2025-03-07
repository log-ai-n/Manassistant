import { supabase } from '../lib/supabase';
import { MenuItem, MenuAllergen, ImportedMenuItem } from '../types/menu';

export const menuService = {
  async addMenuItem(restaurantId: string, data: Partial<MenuItem>, allergens: { id: string; severity: string }[]) {
    try {
      // Insert menu item
      const { data: menuItem, error: menuError } = await supabase
        .from('menu_items')
        .insert({
          restaurant_id: restaurantId,
          name: data.name,
          description: data.description,
          category: data.category,
          price: data.price,
          active: data.active,
        })
        .select()
        .single();

      if (menuError) throw menuError;

      // Insert allergens
      if (allergens.length > 0) {
        const { error: allergenError } = await supabase
          .from('menu_allergens')
          .insert(
            allergens.map(allergen => ({
              menu_item_id: menuItem.id,
              allergen_id: allergen.id,
              severity: allergen.severity,
            }))
          );

        if (allergenError) throw allergenError;
      }

      return { data: menuItem, error: null };
    } catch (error) {
      console.error('Error adding menu item:', error);
      return { data: null, error };
    }
  },

  async importMenuItems(restaurantId: string, items: ImportedMenuItem[]) {
    try {
      const processedItems = items.map(item => ({
        restaurant_id: restaurantId,
        name: item.name,
        description: item.description || null,
        category: item.category || 'Uncategorized',
        price: item.price ? parseFloat(item.price) : null,
        active: true,
      }));

      const { data, error } = await supabase
        .from('menu_items')
        .insert(processedItems)
        .select();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error importing menu items:', error);
      return { data: null, error };
    }
  },

  async getMenuItems(restaurantId: string) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          menu_allergens (
            id,
            allergen_id,
            severity,
            notes,
            allergens (
              id,
              name,
              description
            )
          )
        `)
        .eq('restaurant_id', restaurantId)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return { data: null, error };
    }
  },

  async getAllergens() {
    try {
      const { data, error } = await supabase
        .from('allergens')
        .select('*')
        .order('name');

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching allergens:', error);
      return { data: null, error };
    }
  },

  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .order('name');

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { data: null, error };
    }
  },
};