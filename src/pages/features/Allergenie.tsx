import React from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { AlertTriangle } from 'lucide-react';

const Allergenie: React.FC = () => {
  const { features } = useRestaurant();
  const isEnabled = features.some(f => f.feature_key === 'allergenie' && f.is_enabled);

  if (!isEnabled) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Feature Not Enabled</h3>
            <p className="mt-2 text-sm text-yellow-700">
              The Allergenie feature is currently disabled. Please enable it in Restaurant Settings to access this feature.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Allergenie</h1>
        <p className="text-gray-600">Menu and allergen management system</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Menu Management Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Menu Management</h2>
          <p className="text-gray-500 mb-4">
            Create and manage your menu items with detailed allergen information.
          </p>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Add Menu Item
            </button>
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Import Menu
            </button>
          </div>
        </div>

        {/* Allergen Lookup Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Allergen Lookup</h2>
          <p className="text-gray-500 mb-4">
            Quick access to allergen information for your menu items.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search Menu Items
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter menu item name..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Common Allergens</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {['Gluten', 'Dairy', 'Nuts', 'Shellfish', 'Eggs', 'Soy'].map((allergen) => (
                  <label key={allergen} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">{allergen}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Allergenie;