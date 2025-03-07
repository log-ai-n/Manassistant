import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRestaurant } from '../contexts/RestaurantContext';
import { LogOut, Store } from 'lucide-react';

const StaffLayout: React.FC = () => {
  const { signOut } = useAuth();
  const { currentRestaurant, features } = useRestaurant();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Get enabled features
  const enabledFeatures = features.filter(f => f.is_enabled);

  // Feature metadata for display
  const featureMetadata: Record<string, { name: string; description: string }> = {
    allergenie: {
      name: 'Allergenie',
      description: 'Menu and allergen management system'
    },
    foh_chatbot: {
      name: 'FOH Chatbot',
      description: 'Guest service assistant'
    },
    boh_chatbot: {
      name: 'BOH Chatbot',
      description: 'Kitchen assistance'
    },
    guest_simulator: {
      name: 'Guest Simulator',
      description: 'Staff training simulator'
    },
    store_logai: {
      name: 'Store LogAI',
      description: 'Smart store logging'
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Store className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 ml-2">
                {currentRestaurant?.name}'s Manassistant
              </span>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Show either the app grid or the specific feature content */}
        {window.location.pathname === '/dashboard' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enabledFeatures.map((feature) => (
              <div
                key={feature.feature_key}
                onClick={() => navigate(`/features/${feature.feature_key}`)}
                className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center">
                  <Store className="h-12 w-12 text-blue-600 mb-3" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                  {featureMetadata[feature.feature_key]?.name || feature.feature_key}
                </h3>
                <p className="text-sm text-gray-500 text-center">
                  {featureMetadata[feature.feature_key]?.description || ''}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
};

export default StaffLayout;