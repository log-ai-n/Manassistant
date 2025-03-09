"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuService = void 0;
const supabase_1 = require("../lib/supabase");
exports.menuService = {
    addMenuItem(restaurantId, data, allergens) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Insert menu item
                const { data: menuItem, error: menuError } = yield supabase_1.supabase
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
                if (menuError)
                    throw menuError;
                // Insert allergens
                if (allergens.length > 0) {
                    const { error: allergenError } = yield supabase_1.supabase
                        .from('menu_allergens')
                        .insert(allergens.map(allergen => ({
                        menu_item_id: menuItem.id,
                        allergen_id: allergen.id,
                        severity: allergen.severity,
                    })));
                    if (allergenError)
                        throw allergenError;
                }
                return { data: menuItem, error: null };
            }
            catch (error) {
                console.error('Error adding menu item:', error);
                return { data: null, error };
            }
        });
    },
    importMenuItems(restaurantId, items) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const processedItems = items.map(item => ({
                    restaurant_id: restaurantId,
                    name: item.name,
                    description: item.description || null,
                    category: item.category || 'Uncategorized',
                    price: item.price ? parseFloat(item.price) : null,
                    active: true,
                }));
                const { data, error } = yield supabase_1.supabase
                    .from('menu_items')
                    .insert(processedItems)
                    .select();
                if (error)
                    throw error;
                return { data, error: null };
            }
            catch (error) {
                console.error('Error importing menu items:', error);
                return { data: null, error };
            }
        });
    },
    getMenuItems(restaurantId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, error } = yield supabase_1.supabase
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
                if (error)
                    throw error;
                return { data, error: null };
            }
            catch (error) {
                console.error('Error fetching menu items:', error);
                return { data: null, error };
            }
        });
    },
    getAllergens() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, error } = yield supabase_1.supabase
                    .from('allergens')
                    .select('*')
                    .order('name');
                if (error)
                    throw error;
                return { data, error: null };
            }
            catch (error) {
                console.error('Error fetching allergens:', error);
                return { data: null, error };
            }
        });
    },
    getCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, error } = yield supabase_1.supabase
                    .from('menu_categories')
                    .select('*')
                    .order('name');
                if (error)
                    throw error;
                return { data, error: null };
            }
            catch (error) {
                console.error('Error fetching categories:', error);
                return { data: null, error };
            }
        });
    },
};
