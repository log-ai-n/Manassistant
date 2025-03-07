import React, { useState } from 'react';
import { useRestaurant } from '../../../contexts/RestaurantContext';
import { supabase } from '../../../lib/supabase';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';

const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be 0 or greater').optional(),
  active: z.boolean().default(true),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

interface AllergenOption {
  id: string;
  name: string;
  severity: number;
}

interface AddMenuItemModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddMenuItemModal: React.FC<AddMenuItemModalProps> = ({ onClose, onSuccess }) => {
  const { currentRestaurant } = useRestaurant();
  const [allergens, setAllergens] = useState<any[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<AllergenOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      active: true,
    }
  });

  React.useEffect(() => {
    fetchAllergens();
  }, []);

  const fetchAllergens = async () => {
    try {
      const { data, error } = await supabase
        .from('allergens')
        .select('*')
        .order('name');

      if (error) throw error;
      setAllergens(data || []);
    } catch (err) {
      console.error('Error fetching allergens:', err);
      setError('Failed to load allergens');
    }
  };

  const handleAllergenToggle = (allergen: any) => {
    setSelectedAllergens(prev => {
      const exists = prev.find(a => a.id === allergen.id);
      if (exists) {
        return prev.filter(a => a.id !== allergen.id);
      } else {
        return [...prev, { id: allergen.id, name: allergen.name, severity: 1 }];
      }
    });
  };

  const handleSeverityChange = (allergenId: string, severity: number) => {
    setSelectedAllergens(prev =>
      prev.map(a =>
        a.id === allergenId ? { ...a, severity } : a
      )
    );
  };

  const onSubmit = async (data: MenuItemFormValues) => {
    if (!currentRestaurant) return;

    setLoading(true);
    setError(null);

    try {
      // Insert menu item
      const { data: menuItem, error: menuError } = await supabase
        .from('menu_items')
        .insert({
          ...data,
          restaurant_id: currentRestaurant.id,
        })
        .select()
        .single();

      if (menuError) throw menuError;

      // Insert allergen associations
      if (selectedAllergens.length > 0) {
        const allergenAssociations = selectedAllergens.map(allergen => ({
          menu_item_id: menuItem.id,
          allergen_id: allergen.id,
          severity_level: allergen.severity,
        }));

        const { error: allergenError } = await supabase
          .from('menu_allergens')
          .insert(allergenAssociations);

        if (allergenError) throw allergenError;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error adding menu item:', err);
      setError('Failed to add menu item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Add Menu Item</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              {...register('description')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <input
                type="text"
                id="category"
                {...register('category')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                id="price"
                step="0.01"
                min="0"
                {...register('price', { valueAsNumber: true })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allergens
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allergens.map((allergen) => (
                <div key={allergen.id} className="space-y-2">
                  <label
                    className={clsx(
                      'inline-flex items-center px-3 py-2 rounded-md text-sm cursor-pointer w-full',
                      selectedAllergens.some(a => a.id === allergen.id)
                        ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedAllergens.some(a => a.id === allergen.id)}
                      onChange={() => handleAllergenToggle(allergen)}
                    />
                    <span>{allergen.name}</span>
                  </label>
                  {selectedAllergens.some(a => a.id === allergen.id) && (
                    <select
                      value={selectedAllergens.find(a => a.id === allergen.id)?.severity || 1}
                      onChange={(e) => handleSeverityChange(allergen.id, parseInt(e.target.value))}
                      className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map(level => (
                        <option key={level} value={level}>
                          Severity: {level}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              {...register('active')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Menu Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMenuItemModal;