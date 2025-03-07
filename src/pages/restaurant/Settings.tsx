import React, { useState } from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { supabase } from '../../lib/supabase';
import { Info, AlertCircle, Bell, Copy, Check } from 'lucide-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import clsx from 'clsx';

const featureMetadata: Record<string, {
  name: string;
  description: string;
  category: 'foh' | 'boh' | 'management';
  status: 'active' | 'coming_soon';
  defaultEnabled?: boolean;
}> = {
  allergenie: {
    name: 'Allergenie',
    description: 'Menu and allergen management system with real-time lookup for staff and customers',
    category: 'foh',
    status: 'active',
    defaultEnabled: true
  },
  foh_chatbot: {
    name: 'FOH Chatbot',
    description: 'Guest-facing support for menu inquiries with QR code access',
    category: 'foh',
    status: 'coming_soon'
  },
  guest_simulator: {
    name: 'GuestSimulator',
    description: 'Staff training simulator with synthetic customers and menu knowledge tests',
    category: 'foh',
    status: 'coming_soon'
  },
  boh_chatbot: {
    name: 'BOH Chatbot',
    description: 'Voice-activated assistance for kitchen staff with recipe guides and troubleshooting',
    category: 'boh',
    status: 'coming_soon'
  },
  menu_trainer: {
    name: 'Menu Trainer',
    description: 'Interactive training modules for staff to learn menu items and ingredients',
    category: 'boh',
    status: 'coming_soon'
  },
  waste_optimizer: {
    name: 'Waste Optimizer',
    description: 'AI-powered waste reduction and inventory optimization system',
    category: 'boh',
    status: 'coming_soon'
  },
  menu_planning: {
    name: 'Menu Planning',
    description: 'AI-powered menu planning using historical data and recipes to create special events and new menu items based on past successes',
    category: 'management',
    status: 'coming_soon'
  },
  review_hub: {
    name: 'Review Hub',
    description: 'Centralize and analyze customer feedback across platforms to improve service and menu offerings',
    category: 'management',
    status: 'coming_soon'
  },
  store_logai: {
    name: 'Store LogAI',
    description: 'Automate shift logs, waste tracking, and generate improvement suggestions',
    category: 'management',
    status: 'coming_soon'
  }
};

const categoryNames = {
  foh: 'Front of House',
  boh: 'Back of House',
  management: 'Management & Analytics'
};

type Feature = {
  id: string;
  restaurant_id: string;
  feature_key: string;
  is_enabled: boolean;
  display_name?: string;
  description?: string;
};

const RestaurantSettings: React.FC = () => {
  const { currentRestaurant, updateRestaurant, userRole } = useRestaurant();
  
  const [name, setName] = useState(currentRestaurant?.name || '');
  const [address, setAddress] = useState(currentRestaurant?.address || '');
  const [phone, setPhone] = useState(currentRestaurant?.phone || '');
  const [active, setActive] = useState(currentRestaurant?.active || true);
  const [copied, setCopied] = useState(false);
  
  const [features, setFeatures] = useState<Feature[]>([]);
  const [notifyFeatures, setNotifyFeatures] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canEdit = userRole === 'owner' || userRole === 'manager';

  React.useEffect(() => {
    if (currentRestaurant) {
      setName(currentRestaurant.name);
      setAddress(currentRestaurant.address || '');
      setPhone(currentRestaurant.phone || '');
      setActive(currentRestaurant.active);
      fetchFeatures();
    }
  }, [currentRestaurant]);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchFeatures = async () => {
    if (!currentRestaurant) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('restaurant_features')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id);

      if (error) throw error;

      const enhancedFeatures = data.map((feature) => ({
        ...feature,
        display_name: featureMetadata[feature.feature_key]?.name || feature.feature_key,
        description: featureMetadata[feature.feature_key]?.description || '',
      }));

      setFeatures(enhancedFeatures);
    } catch (error) {
      console.error('Error fetching features:', error);
      setError('Failed to load features');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentRestaurant) return;
    if (!name.trim()) {
      setError('Restaurant name is required');
      return;
    }

    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const updates = {
        name,
        address,
        phone,
        active,
      };

      const { error } = await updateRestaurant(currentRestaurant.id, updates);

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Restaurant settings updated successfully');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleFeature = async (featureId: string, isEnabled: boolean) => {
    if (!currentRestaurant || !canEdit) return;

    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('restaurant_features')
        .update({ is_enabled: isEnabled })
        .eq('id', featureId);

      if (error) throw error;

      setFeatures(
        features.map((f) => (f.id === featureId ? { ...f, is_enabled: isEnabled } : f))
      );
      setSuccess('Feature updated successfully');
    } catch (err) {
      setError('Failed to update feature');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNotifyFeature = (featureKey: string) => {
    const newNotifyFeatures = new Set(notifyFeatures);
    if (notifyFeatures.has(featureKey)) {
      newNotifyFeatures.delete(featureKey);
    } else {
      newNotifyFeatures.add(featureKey);
    }
    setNotifyFeatures(newNotifyFeatures);
    setSuccess('You will be notified when this feature becomes available');
  };

  const groupedFeatures = Object.entries(featureMetadata).reduce((acc, [key, meta]) => {
    if (!acc[meta.category]) {
      acc[meta.category] = [];
    }
    const existingFeature = features.find(f => f.feature_key === key);
    acc[meta.category].push({
      id: existingFeature?.id || key,
      feature_key: key,
      is_enabled: existingFeature?.is_enabled || false,
      ...meta
    });
    return acc;
  }, {} as Record<string, any[]>);

  if (!currentRestaurant) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select a restaurant first</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Restaurant Settings</h1>
        <p className="text-gray-600">Manage your restaurant details and features</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Restaurant Details</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  disabled={!canEdit}
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={!canEdit}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={!canEdit}
                />
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Team Access Settings</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Restaurant Code
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      value={currentRestaurant?.restaurant_code || ''}
                      className="flex-1 block w-full rounded-l-md border-gray-300 bg-gray-50 sm:text-sm"
                      disabled
                    />
                    <CopyToClipboard 
                      text={currentRestaurant?.restaurant_code || ''}
                      onCopy={handleCopy}
                    >
                      <button
                        type="button"
                        className="relative inline-flex items-center px-4 py-2 -ml-px space-x-2 text-sm font-medium border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-green-500">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 text-gray-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </CopyToClipboard>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    This code will be used by your staff members to access your restaurant.
                  </p>
                </div>
              </div>

              {userRole === 'owner' && (
                <div>
                  <div className="flex items-center">
                    <input
                      id="active"
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={!canEdit}
                    />
                    <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                      Restaurant is active
                    </label>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Inactive restaurants won't be accessible to staff members.
                  </p>
                </div>
              )}

              {canEdit && (
                <div>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Features</h2>
          <p className="text-gray-600 mb-6">Enable or disable features for your restaurant</p>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <Info className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Welcome to Features! Here you can manage all the tools and capabilities available for your restaurant.
                  Start with Allergenie for menu and allergen management, and explore our upcoming features.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
                <div key={category}>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {categoryNames[category as keyof typeof categoryNames]}
                  </h3>
                  <div className="space-y-4">
                    {categoryFeatures.map((feature) => (
                      <div
                        key={feature.feature_key}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h4 className="text-lg font-medium text-gray-900">
                                {feature.name}
                              </h4>
                              {feature.status === 'coming_soon' && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Coming Soon
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
                          </div>
                          <div className="ml-4 flex items-center space-x-2">
                            {feature.status === 'coming_soon' ? (
                              <button
                                onClick={() => handleNotifyFeature(feature.feature_key)}
                                className={`inline-flex items-center px-3 py-1.5 border ${
                                  notifyFeatures.has(feature.feature_key)
                                    ? 'border-blue-500 text-blue-500'
                                    : 'border-gray-300 text-gray-700'
                                } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                              >
                                <Bell className="h-4 w-4 mr-1" />
                                {notifyFeatures.has(feature.feature_key) ? 'Notified' : 'Notify Me'}
                              </button>
                            ) : (
                              <label className="inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={feature.is_enabled}
                                  onChange={() =>
                                    handleToggleFeature(feature.id, !feature.is_enabled)
                                  }
                                  disabled={isUpdating || !canEdit}
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantSettings;