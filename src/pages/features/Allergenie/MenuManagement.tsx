import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../../contexts/RestaurantContext';
import { supabase } from '../../../lib/supabase';
import { Plus, Upload, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface MenuManagementProps {
  onAddClick: () => void;
  onImportClick: () => void;
  refreshTrigger: number;
}

const MenuManagement: React.FC<MenuManagementProps> = ({
  onAddClick,
  onImportClick,
  refreshTrigger
}) => {
  const { currentRestaurant } = useRestaurant();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentRestaurant) {
      fetchMenuItems();
    }
  }, [currentRestaurant, refreshTrigger]);

  const fetchMenuItems = async () => {
    if (!currentRestaurant) return;

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          menu_allergens (
            id,
            allergen_id,
            severity,
            allergens (
              id,
              name
            )
          )
        `)
        .eq('restaurant_id', currentRestaurant.id)
        .order('name');

      if (error) throw error;

      setMenuItems(data || []);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onAddClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Menu Item
        </button>
        <button
          onClick={onImportClick}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Upload className="h-4 w-4 mr-2" />
          Import Menu
        </button>
      </div>

      {/* Menu Items List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {menuItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No menu items yet. Add your first item or import a menu.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {menuItems.map((item) => (
              <li key={item.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                    {item.description && (
                      <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                    )}
                    {item.menu_allergens && item.menu_allergens.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.menu_allergens.map((allergen: any) => (
                          <span
                            key={allergen.id}
                            className={clsx(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              {
                                'bg-red-100 text-red-800': allergen.severity === 'High',
                                'bg-yellow-100 text-yellow-800': allergen.severity === 'Medium',
                                'bg-green-100 text-green-800': allergen.severity === 'Low'
                              }
                            )}
                          >
                            {allergen.allergens?.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex items-center space-x-4">
                    {item.price && (
                      <span className="text-lg font-medium text-gray-900">
                        ${item.price.toFixed(2)}
                      </span>
                    )}
                    <span
                      className={clsx(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        item.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      )}
                    >
                      {item.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MenuManagement;