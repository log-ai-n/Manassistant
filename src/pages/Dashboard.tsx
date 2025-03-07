import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRestaurant } from '../contexts/RestaurantContext';
import { PlusCircle, Store, RefreshCw, Eye, X } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

const StaffViewPreview: React.FC<{ restaurant: any; onClose: () => void }> = ({ restaurant, onClose }) => {
  const { features } = useRestaurant();

  const featureIcons = {
    allergenie: <Store className="h-12 w-12 mb-3" />,
    review_hub: <Store className="h-12 w-12 mb-3" />,
    foh_chatbot: <Store className="h-12 w-12 mb-3" />,
    boh_chatbot: <Store className="h-12 w-12 mb-3" />,
    store_logai: <Store className="h-12 w-12 mb-3" />,
    guest_simulator: <Store className="h-12 w-12 mb-3" />,
  };

  const featureNames = {
    allergenie: 'Allergenie',
    review_hub: 'Review Hub',
    foh_chatbot: 'FOH Chatbot',
    boh_chatbot: 'BOH Chatbot',
    store_logai: 'Store LogAI',
    guest_simulator: 'Guest Simulator',
  };

  const featureDescriptions = {
    allergenie: 'Menu and allergen management system',
    review_hub: 'Customer feedback analysis',
    foh_chatbot: 'Guest service assistant',
    boh_chatbot: 'Kitchen assistance',
    store_logai: 'Smart store logging',
    guest_simulator: 'Staff training simulator',
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl h-[80vh] rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{restaurant.name}</h2>
            <p className="text-sm text-gray-500">Staff Interface Preview</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(featureNames).map(([key, name]) => {
              const isEnabled = features.some(f => f.feature_key === key && f.is_enabled);
              
              return (
                <div
                  key={key}
                  className={clsx(
                    'relative bg-white rounded-lg shadow-md p-6 text-center transition-all',
                    isEnabled 
                      ? 'hover:shadow-lg cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="flex justify-center">
                    {featureIcons[key as keyof typeof featureIcons]}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{name}</h3>
                  <p className="text-sm text-gray-500">
                    {featureDescriptions[key as keyof typeof featureDescriptions]}
                  </p>
                  {!isEnabled && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 rounded-lg flex items-center justify-center">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                        Coming Soon
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    currentRestaurant, 
    userRestaurants, 
    createRestaurant, 
    setCurrentRestaurant,
    loading,
    error: restaurantError,
    refreshRestaurants
  } = useRestaurant();
  const navigate = useNavigate();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRestaurantName, setNewRestaurantName] = useState('');
  const [newRestaurantAddress, setNewRestaurantAddress] = useState('');
  const [newRestaurantPhone, setNewRestaurantPhone] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewRestaurant, setPreviewRestaurant] = useState<any | null>(null);

  const handleRestaurantClick = (restaurant: any, e: React.MouseEvent) => {
    // Prevent click when clicking the preview button
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }

    setCurrentRestaurant(restaurant);
    navigate('/restaurant/settings');
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestaurantName.trim()) {
      setError('Restaurant name is required');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const { error, data } = await createRestaurant(
        newRestaurantName,
        newRestaurantAddress,
        newRestaurantPhone
      );

      if (error) {
        setError(error.message);
      } else if (data) {
        setNewRestaurantName('');
        setNewRestaurantAddress('');
        setNewRestaurantPhone('');
        setShowCreateForm(false);
        setCurrentRestaurant(data);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshRestaurants();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.email}</p>
        </div>
        <button 
          onClick={handleRefresh} 
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isRefreshing}
        >
          <RefreshCw className={clsx('mr-1 h-4 w-4', isRefreshing && 'animate-spin')} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {restaurantError && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{restaurantError}</p>
              <p className="mt-2 text-xs text-red-700">
                Try refreshing the page or checking your network connection.
              </p>
            </div>
          </div>
        </div>
      )}

      {userRestaurants.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <Store className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            {restaurantError ? 'Could not load restaurants' : 'No restaurants yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {restaurantError 
              ? 'There was a problem loading your restaurants. You can try refreshing or creating a new restaurant.'
              : 'Get started by creating your first restaurant.'}
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Restaurant
            </button>
            {restaurantError && (
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isRefreshing}
              >
                <RefreshCw className={clsx('mr-2 h-5 w-5', isRefreshing && 'animate-spin')} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Your Restaurants</h2>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle className="mr-1 h-4 w-4" />
              Add New
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {userRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className={clsx(
                  'bg-white shadow rounded-lg p-6 cursor-pointer transition-all hover:shadow-md',
                  currentRestaurant?.id === restaurant.id && 'ring-2 ring-blue-500'
                )}
                onClick={(e) => handleRestaurantClick(restaurant, e)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{restaurant.name}</h3>
                    {restaurant.address && (
                      <p className="mt-1 text-sm text-gray-500">{restaurant.address}</p>
                    )}
                    {restaurant.phone && (
                      <p className="mt-1 text-sm text-gray-500">{restaurant.phone}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewRestaurant(restaurant);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full"
                    title="Preview Staff Interface"
                  >
                    <Eye className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
                <div className="mt-4 flex items-center">
                  <span
                    className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      restaurant.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    )}
                  >
                    {restaurant.active ? 'Active' : 'Inactive'}
                  </span>
                  {restaurant.restaurant_code && (
                    <span className="ml-2 text-xs text-gray-500">
                      ID: {restaurant.restaurant_code}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Restaurant Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Restaurant</h2>
            
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleCreateRestaurant}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newRestaurantName}
                    onChange={(e) => setNewRestaurantName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={newRestaurantAddress}
                    onChange={(e) => setNewRestaurantAddress(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phone"
                    value={newRestaurantPhone}
                    onChange={(e) => setNewRestaurantPhone(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff View Preview Modal */}
      {previewRestaurant && (
        <StaffViewPreview
          restaurant={previewRestaurant}
          onClose={() => setPreviewRestaurant(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;