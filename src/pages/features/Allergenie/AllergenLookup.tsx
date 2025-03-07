import React, { useState } from 'react';
import { useRestaurant } from '../../../contexts/RestaurantContext';
import { supabase } from '../../../lib/supabase';
import { Search, AlertCircle } from 'lucide-react';

const AllergenLookup: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);

  const commonAllergens = [
    'Milk',
    'Eggs',
    'Fish',
    'Shellfish',
    'Tree Nuts',
    'Peanuts',
    'Wheat',
    'Soybeans'
  ];

  const handleSearch = async () => {
    if (!currentRestaurant) return;
    if (!searchTerm && selectedAllergens.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('menu_items')
        .select(`
          *,
          menu_allergens (
            allergens (
              id,
              name,
              severity_level
            )
          )
        `)
        .eq('restaurant_id', currentRestaurant.id)
        .eq('active', true);

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by selected allergens if any
      const filteredData = selectedAllergens.length > 0
        ? data.filter(item =>
            item.menu_allergens.some((ma: any) =>
              selectedAllergens.includes(ma.allergens.name)
            )
          )
        : data;

      setResults(filteredData);
    } catch (err) {
      console.error('Error searching menu items:', err);
      setError('Failed to search menu items');
    } finally {
      setLoading(false);
    }
  };

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens(prev =>
      prev.includes(allergen)
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

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

      <div className="bg-white shadow rounded-lg p-6">
        {/* Search Input */}
        <div className="mb-6">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search Menu Items
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              name="search"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter menu item name..."
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Allergen Filters */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Allergens
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {commonAllergens.map((allergen) => (
              <label
                key={allergen}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm cursor-pointer ${
                  selectedAllergens.includes(allergen)
                    ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selectedAllergens.includes(allergen)}
                  onChange={() => toggleAllergen(allergen)}
                />
                <span>{allergen}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Searching...
            </>
          ) : (
            'Search'
          )}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {results.map((item) => (
              <li key={item.id} className="px-4 py-4 sm:px-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                  {item.description && (
                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                  )}
                  {item.menu_allergens.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.menu_allergens.map((ma: any) => (
                        <span
                          key={ma.allergens.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                        >
                          {ma.allergens.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AllergenLookup;