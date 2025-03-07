import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRestaurant } from '../contexts/RestaurantContext';
import { ChevronDown, LogOut, Settings, Users, LayoutGrid, Menu, X, UserCog, Utensils, Store } from 'lucide-react';
import clsx from 'clsx';

const Layout: React.FC = () => {
  const { user, signOut } = useAuth();
  const { currentRestaurant, userRestaurants, setCurrentRestaurant, userRole, features } = useRestaurant();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [restaurantDropdownOpen, setRestaurantDropdownOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleRestaurantChange = (restaurant: any) => {
    setCurrentRestaurant(restaurant);
    setRestaurantDropdownOpen(false);
  };

  // Get enabled features
  const enabledFeatures = features.filter(f => f.is_enabled);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <span className="text-xl font-bold text-blue-600 ml-2">
                Manassistant
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {currentRestaurant && (
                <div className="relative">
                  <button
                    onClick={() => setRestaurantDropdownOpen(!restaurantDropdownOpen)}
                    className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    <span className="mr-1">{currentRestaurant.name}</span>
                    <ChevronDown size={16} />
                  </button>
                  {restaurantDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        {userRestaurants.map((restaurant) => (
                          <button
                            key={restaurant.id}
                            onClick={() => handleRestaurantChange(restaurant)}
                            className={clsx(
                              "block w-full text-left px-4 py-2 text-sm hover:bg-gray-100",
                              currentRestaurant?.id === restaurant.id
                                ? "text-blue-600 bg-blue-50"
                                : "text-gray-700"
                            )}
                          >
                            <div className="flex items-center">
                              <Store className="h-4 w-4 mr-2" />
                              <span>{restaurant.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <Link
                to="/settings"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                title="User Settings"
              >
                <UserCog size={20} />
              </Link>
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

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } md:w-64 bg-white shadow-md fixed inset-y-0 pt-16 z-10 transition-all duration-300 ease-in-out`}
        >
          <div className="h-full overflow-y-auto">
            <div className="px-4 py-6">
              {/* Sidebar Header with Close Button */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 -ml-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                  >
                    <X size={24} />
                  </button>
                  <span className="text-xl font-bold text-blue-600 ml-2">
                    Manassistant
                  </span>
                </div>
              </div>

              {/* User Info */}
              {user && (
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-500">Logged in as</div>
                  <div className="text-sm font-medium text-gray-900">{user.email}</div>
                  {userRole && (
                    <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {userRole}
                    </div>
                  )}
                </div>
              )}

              <nav className="space-y-1">
                <Link
                  to="/dashboard"
                  className={clsx(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    location.pathname === '/dashboard'
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <LayoutGrid
                    className={clsx(
                      "mr-3 flex-shrink-0 h-6 w-6",
                      location.pathname === '/dashboard'
                        ? "text-blue-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  Dashboard
                </Link>

                {(userRole === 'owner' || userRole === 'manager') && (
                  <>
                    <Link
                      to="/restaurant/settings"
                      className={clsx(
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                        location.pathname === '/restaurant/settings'
                          ? "bg-blue-100 text-blue-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Settings
                        className={clsx(
                          "mr-3 flex-shrink-0 h-6 w-6",
                          location.pathname === '/restaurant/settings'
                            ? "text-blue-500"
                            : "text-gray-400 group-hover:text-gray-500"
                        )}
                      />
                      Restaurant Settings
                    </Link>

                    <Link
                      to="/restaurant/members"
                      className={clsx(
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                        location.pathname === '/restaurant/members'
                          ? "bg-blue-100 text-blue-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Users
                        className={clsx(
                          "mr-3 flex-shrink-0 h-6 w-6",
                          location.pathname === '/restaurant/members'
                            ? "text-blue-500"
                            : "text-gray-400 group-hover:text-gray-500"
                        )}
                      />
                      Team Members
                    </Link>
                  </>
                )}

                {/* Restaurant Features Section */}
                {currentRestaurant && enabledFeatures.length > 0 && (
                  <div className="pt-4">
                    <div className="px-2 mb-2">
                      <div className="flex items-center">
                        <Store className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {currentRestaurant.name}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {enabledFeatures.map(feature => (
                        <Link
                          key={feature.feature_key}
                          to={`/features/${feature.feature_key}`}
                          className={clsx(
                            "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                            location.pathname === `/features/${feature.feature_key}`
                              ? "bg-blue-100 text-blue-900"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          )}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Utensils
                            className={clsx(
                              "mr-3 flex-shrink-0 h-6 w-6",
                              location.pathname === `/features/${feature.feature_key}`
                                ? "text-blue-500"
                                : "text-gray-400 group-hover:text-gray-500"
                            )}
                          />
                          {feature.feature_key === 'allergenie' ? 'Allergenie' : feature.feature_key}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 ${sidebarOpen ? 'md:ml-64' : ''} transition-all duration-300 ease-in-out`}>
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;