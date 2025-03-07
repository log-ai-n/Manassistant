import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { supabase } from '../../lib/supabase';
import { Settings, Info, AlertCircle, Bell } from 'lucide-react';

type Feature = {
  id: string;
  restaurant_id: string;
  feature_key: string;
  is_enabled: boolean;
  display_name?: string;
  description?: string;
};

// Feature metadata for UI display and categorization
const featureMetadata: Record<string, {
  name: string;
  description: string;
  category: 'foh' | 'boh' | 'management';
  status: 'active' | 'coming_soon';
  defaultEnabled?: boolean;
}> = {
  // Front of House Features
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

  // Back of House Features
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

  // Management Features
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

const RestaurantFeatures: React.FC = () => {
  const { currentRestaurant, userRole } = useRestaurant();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFeatureKey, setNewFeatureKey] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [notifyFeatures, setNotifyFeatures] = useState<Set<string>>(new Set());

  const canManageFeatures = userRole === 'owner' || userRole === 'manager';

  useEffect(() => {
    if (currentRestaurant) {
      fetchFeatures();
    }
  }, [currentRestaurant]);

  const fetchFeatures = async () => {
    if (!currentRestaurant) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('restaurant_features')
        .select('*')
        .eq('restaurant_id', currentRestaurant.id);

      if (error) {
        throw error;
      }

      // Enhance features with metadata
      const enhancedFeatures = data.map((feature) => ({
        ...feature,
        display_name: featureMetadata[feature.feature_key]?.name || feature.feature_key,
        description: featureMetadata[feature.feature_key]?.description || '',
      }));

      setFeatures(enhancedFeatures);
    } catch (error) {
      console.error('Error fetching features:', error);
      setError('Failed to load features. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeature = async (featureId: string, isEnabled: boolean) => {
    if (!currentRestaurant || !canManageFeatures) return;

    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('restaurant_features')
        .update({ is_enabled: isEnabled })
        .eq('id', featureId);

      if (error) {
        throw error;
      }

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

  // Group features by category
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
        <h1 className="text-2xl font-bold text-gray-900">Restaurant Features</h1>
        <p className="text-gray-600">Enable or disable features for your restaurant</p>
      </div>

      {/* First-time User Experience */}
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

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
            <div key={category} className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {categoryNames[category as keyof typeof categoryNames]}
              </h2>
              <div className="space-y-4">
                {categoryFeatures.map((feature) => (
                  <div
                    key={feature.feature_key}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">
                            {feature.name}
                          </h3>
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
                              disabled={isUpdating || !canManageFeatures}
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
  );
};

export default RestaurantFeatures;