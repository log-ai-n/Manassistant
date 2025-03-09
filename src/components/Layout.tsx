import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRestaurant } from '../contexts/RestaurantContext';
import { 
  ChevronDown, 
  LogOut, 
  Settings, 
  Users, 
  Menu, 
  X, 
  Home, 
  Activity,
  Info,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle
} from 'lucide-react';
import clsx from 'clsx';

// Main navigation items with consistent naming and icons
const navItems = [
  { name: 'Dashboard', path: '/', icon: Home, description: 'View restaurant performance at a glance' },
  { name: 'Activity', path: '/activity', icon: Activity, description: 'Track recent events and actions' },
  { name: 'Team', path: '/team', icon: Users, description: 'Manage restaurant staff and permissions' },
  { name: 'Settings', path: '/settings', icon: Settings, description: 'Configure restaurant settings' },
];

// Reusable tooltip component
const Tooltip = ({ children, content, enabled = true }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  if (!enabled) return children;
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute left-full ml-2 top-0 z-10 bg-gray-800 text-white text-xs rounded py-1 px-2 min-w-[150px] whitespace-normal">
          {content}
          <div className="absolute top-2 -left-1 w-2 h-2 bg-gray-800 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};

// Reusable button component to ensure consistency
const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false }) => {
  const baseClasses = "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600 focus:ring-gray-500"
  };
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
  
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabledClasses,
        className
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const { currentRestaurant, userRestaurants, setCurrentRestaurant, userRole, features } = useRestaurant();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [restaurantDropdownOpen, setRestaurantDropdownOpen] = useState(false);
  const [showTooltips, setShowTooltips] = useState(true); // Control tooltips for onboarding

  // Handle user sign out
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Handle restaurant switching
  const handleRestaurantChange = (restaurant: any) => {
    setCurrentRestaurant(restaurant);
    setRestaurantDropdownOpen(false);
  };

  // Get enabled features
  const enabledFeatures = features.filter(f => f.is_enabled);

  // Toggle sidebar open/closed
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Dismiss tooltips for experienced users
  const dismissTooltips = () => {
    setShowTooltips(false);
    // Could also save this preference to user profile
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-10 bg-white border-r transform transition-all duration-200 ease-in-out flex flex-col',
          isSidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Sidebar header with logo */}
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className={clsx("font-semibold transition-opacity", 
            isSidebarOpen ? "text-xl opacity-100" : "text-lg opacity-0 w-0 overflow-hidden"
          )}>
            Manassist Hub
          </h1>
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? <ChevronsLeft size={20} /> : <ChevronsRight size={20} />}
          </button>
        </div>

        {/* Restaurant selector */}
        {currentRestaurant && (
          <div className="px-4 py-2 border-b">
            <div 
              onClick={() => setRestaurantDropdownOpen(!restaurantDropdownOpen)}
              className="flex items-center justify-between cursor-pointer p-2 rounded-md hover:bg-gray-100"
            >
              <div className={clsx("flex items-center", !isSidebarOpen && "justify-center w-full")}>
                <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-sm">
                  {currentRestaurant.name.charAt(0)}
                </div>
                {isSidebarOpen && (
                  <span className="ml-2 text-sm font-medium truncate max-w-[160px]">
                    {currentRestaurant.name}
                  </span>
                )}
              </div>
              {isSidebarOpen && <ChevronDown size={16} />}
            </div>
            
            {/* Restaurant dropdown */}
            {restaurantDropdownOpen && isSidebarOpen && (
              <div className="mt-2 bg-white border rounded-md shadow-lg py-1 absolute z-20 w-56">
                {userRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    onClick={() => handleRestaurantChange(restaurant)}
                    className={clsx(
                      "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100",
                      restaurant.id === currentRestaurant.id && "bg-blue-50 text-blue-600"
                    )}
                  >
                    {restaurant.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation items */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Tooltip 
                key={item.path} 
                content={item.description}
                enabled={showTooltips}
              >
                <Link
                  to={item.path}
                  className={clsx(
                    'flex items-center py-2 transition-colors',
                    isSidebarOpen ? 'px-4 mx-3 rounded-md' : 'px-0 mx-0 justify-center',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <Icon size={20} className={clsx(!isSidebarOpen && 'mx-auto')} />
                  {isSidebarOpen && <span className="ml-3 text-sm">{item.name}</span>}
                </Link>
              </Tooltip>
            );
          })}

          {/* Conditionally show first-time user help */}
          {showTooltips && isSidebarOpen && (
            <div className="mx-4 mt-4 p-3 bg-blue-50 rounded-md">
              <div className="flex items-start">
                <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="ml-2">
                  <p className="text-xs text-blue-800">
                    Hover over menu items to learn more about each section
                  </p>
                  <button 
                    onClick={dismissTooltips}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium"
                  >
                    Don't show again
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* User profile section */}
        {user && (
          <div className="p-4 border-t">
            <div className={clsx("flex items-center", !isSidebarOpen && "justify-center")}>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                {user.email.charAt(0).toUpperCase()}
              </div>
              
              {isSidebarOpen && (
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.email}
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center mt-1"
                  >
                    <LogOut size={12} className="mr-1" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile navigation overlay */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-20 bg-white border-b p-4 flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-xl font-semibold">Manassist Hub</h1>
        </div>
      </div>

      {/* Main content */}
      <main
        className={clsx(
          'flex-1 transition-all duration-200 ease-in-out p-6',
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20',
          'mt-16 lg:mt-0' // Add top margin for mobile header
        )}
      >
        {children || <Outlet />}
      </main>
    </div>
  );
}