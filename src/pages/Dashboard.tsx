import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRestaurant } from '../contexts/RestaurantContext';
import { 
  PieChart, 
  Store, 
  ArrowUpRight, 
  Clock, 
  Users, 
  DollarSign, 
  HelpCircle,
  X,
  ChevronRight,
  Bell,
  Star,
  ArrowRight,
  Calendar,
  Clipboard
} from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

// Tooltip for progressive onboarding
const OnboardingTooltip = ({ 
  id, 
  title, 
  content, 
  position = 'right', 
  onDismiss, 
  active 
}: { 
  id: string; 
  title: string; 
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  onDismiss: () => void;
  active: boolean;
}) => {
  if (!active) return null;

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-t-2 border-l-2",
    right: "right-full top-1/2 transform -translate-y-1/2 border-r-2 border-t-2",
    bottom: "bottom-full left-1/2 transform -translate-x-1/2 border-b-2 border-r-2",
    left: "left-full top-1/2 transform -translate-y-1/2 border-l-2 border-b-2",
  };

  return (
    <div 
      className={clsx(
        "absolute z-50 bg-white border border-blue-100 rounded-lg shadow-lg p-3 w-64",
        positionClasses[position]
      )}
      data-tour-id={id}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <button 
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>
      <p className="text-sm text-gray-600">{content}</p>
      <div 
        className={clsx(
          "absolute w-3 h-3 bg-white transform rotate-45",
          arrowClasses[position]
        )}
      ></div>
    </div>
  );
};

// Stat Card component for key metrics
const StatCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  tooltip,
  onboardingId,
  isOnboardingActive
}: { 
  title: string; 
  value: string; 
  change: { value: number; label: string }; 
  icon: React.ReactNode;
  tooltip?: string;
  onboardingId?: string;
  isOnboardingActive?: boolean;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const changeColor = change.value > 0 ? 'text-green-600' : 'text-red-600';
  
  return (
    <div className="relative bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md">
      {tooltip && (
        <button 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <HelpCircle size={16} />
          {showTooltip && (
            <div className="absolute right-0 top-full mt-1 bg-gray-800 text-white text-xs rounded py-1 px-2 min-w-[200px] z-10">
              {tooltip}
            </div>
          )}
        </button>
      )}
      
      <div className="flex items-center">
        <div className="p-2 rounded-md bg-blue-50 text-blue-600 mr-4">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        <span className={clsx("text-sm font-medium", changeColor)}>
          {change.value > 0 ? '+' : ''}{change.value}%
        </span>
        <span className="text-xs text-gray-500 ml-1.5">{change.label}</span>
      </div>

      {onboardingId && isOnboardingActive && (
        <OnboardingTooltip
          id={onboardingId}
          title={`Track ${title}`}
          content={`This card shows you the current ${title.toLowerCase()} and how it's changed recently.`}
          position="bottom"
          onDismiss={() => {}} // This would be handled by the parent component
          active={isOnboardingActive}
        />
      )}
    </div>
  );
};

// Action Card component for quick actions
const ActionCard = ({ 
  title, 
  description, 
  icon, 
  onClick,
  primary = false
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) => (
  <div 
    className={clsx(
      "bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all hover:shadow-md",
      primary && "border-l-4 border-blue-500"
    )}
    onClick={onClick}
  >
    <div className="flex items-start">
      <div className="p-2 rounded-md bg-blue-50 text-blue-600 mr-4 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <div className="text-blue-600 flex-shrink-0">
        <ArrowRight size={20} />
      </div>
    </div>
  </div>
);

// Notification component
const Notification = ({ 
  title, 
  time, 
  read = false, 
  onClick 
}: { 
  title: string; 
  time: string; 
  read?: boolean; 
  onClick: () => void;
}) => (
  <div 
    className={clsx(
      "px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors",
      !read && "bg-blue-50 hover:bg-blue-100"
    )}
    onClick={onClick}
  >
    <div className="flex justify-between">
      <div className="flex items-start">
        <div className={clsx(
          "w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0", 
          read ? "bg-gray-300" : "bg-blue-500"
        )} />
        <div>
          <p className={clsx(
            "text-sm", 
            read ? "text-gray-600" : "text-gray-900 font-medium"
          )}>
            {title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{time}</p>
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-400 mt-1" />
    </div>
  </div>
);

// Task component
const Task = ({ 
  title, 
  completed = false, 
  onClick 
}: { 
  title: string; 
  completed?: boolean; 
  onClick: () => void;
}) => (
  <div 
    className="px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
    onClick={onClick}
  >
    <div className="flex items-center">
      <div className={clsx(
        "w-5 h-5 rounded-full border flex items-center justify-center mr-3 flex-shrink-0",
        completed ? "bg-green-500 border-green-500" : "border-gray-300"
      )}>
        {completed && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
      <p className={clsx(
        "text-sm",
        completed ? "text-gray-500 line-through" : "text-gray-900"
      )}>
        {title}
      </p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentRestaurant, userRestaurants, features } = useRestaurant();
  const navigate = useNavigate();
  
  // State for onboarding
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);
  
  // Dummy data for demonstration
  const stats = [
    { 
      title: 'Average Orders', 
      value: '94', 
      change: { value: 12, label: 'vs last week' }, 
      icon: <Clipboard size={20} />,
      tooltip: 'The average number of orders received per day',
      onboardingId: 'orders-stat'
    },
    { 
      title: 'Revenue', 
      value: '$3,249', 
      change: { value: 8, label: 'vs last week' }, 
      icon: <DollarSign size={20} />,
      tooltip: 'Total revenue generated this week'
    },
    { 
      title: 'Customers', 
      value: '481', 
      change: { value: 3, label: 'vs last week' }, 
      icon: <Users size={20} />,
      tooltip: 'Total unique customers served this week'
    },
    { 
      title: 'Avg. Serving Time', 
      value: '18min', 
      change: { value: -5, label: 'vs last week' }, 
      icon: <Clock size={20} />,
      tooltip: 'Average time between order and service completion'
    },
  ];
  
  const notifications = [
    { id: 1, title: 'New review received (4.5★)', time: '10 minutes ago', read: false },
    { id: 2, title: 'Staff schedule updated for tomorrow', time: '1 hour ago', read: false },
    { id: 3, title: 'Inventory alert: Low stock on rice', time: '3 hours ago', read: true },
    { id: 4, title: 'New feature available: Guest Simulator', time: '1 day ago', read: true },
  ];
  
  const tasks = [
    { id: 1, title: 'Review staff schedule for the weekend', completed: false },
    { id: 2, title: 'Update menu items with seasonal offerings', completed: false },
    { id: 3, title: 'Respond to customer feedback', completed: true },
    { id: 4, title: 'Check inventory levels', completed: true },
  ];

  // Handle dismissing the onboarding steps
  const dismissOnboarding = () => {
    setShowOnboarding(false);
    // In a real app, we would save this preference to user settings
  };

  const moveToNextOnboardingStep = () => {
    setOnboardingStep(prev => prev + 1);
    // If we've reached the end of onboarding, dismiss it
    if (onboardingStep >= 2) {
      dismissOnboarding();
    }
  };

  // Handle navigation to a specific feature
  const navigateToFeature = (featureKey: string) => {
    navigate(`/features/${featureKey}`);
  };
  
  // Check if user is new (would be from backend in real app)
  const isNewUser = user && new Date(user.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'Restaurant Manager'}
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening at {currentRestaurant?.name || 'your restaurant'} today.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-3 relative">
          <button
            onClick={() => navigate('/restaurant/settings')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Restaurant Settings
          </button>
          
          <button
            onClick={() => {}} // Would open insights/reports
            className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Reports
          </button>
          
          {/* Welcome onboarding tooltip */}
          {showOnboarding && onboardingStep === 0 && (
            <OnboardingTooltip
              id="welcome-onboarding"
              title="Welcome to Manassist Hub!"
              content="This is your restaurant dashboard. We'll show you around the main features."
              position="bottom"
              onDismiss={moveToNextOnboardingStep}
              active={true}
            />
          )}
        </div>
      </div>
      
      {/* Key stats section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            tooltip={stat.tooltip}
            onboardingId={stat.onboardingId}
            isOnboardingActive={showOnboarding && onboardingStep === 1 && index === 0}
          />
        ))}
        
        {/* Stats onboarding tooltip */}
        {showOnboarding && onboardingStep === 1 && (
          <div className="absolute bottom-full left-0 mb-2">
            <button
              onClick={moveToNextOnboardingStep}
              className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white shadow-md hover:bg-blue-700"
            >
              Next: Explore Features
            </button>
          </div>
        )}
      </div>
      
      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured actions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            <ActionCard
              title="Update Menu"
              description="Add new items or edit existing ones"
              icon={<Clipboard size={20} />}
              onClick={() => navigateToFeature('allergenie')}
              primary={true}
            />
            
            <ActionCard
              title="Review Analytics"
              description="Get insights into your restaurant's performance"
              icon={<PieChart size={20} />}
              onClick={() => {}} // Would navigate to analytics
            />
            
            <ActionCard
              title="Manage Staff"
              description="Schedule and assign roles to your team"
              icon={<Users size={20} />}
              onClick={() => navigate('/team')}
            />
            
            <ActionCard
              title="Customer Feedback"
              description="View and respond to recent reviews"
              icon={<Star size={20} />}
              onClick={() => navigateToFeature('review_hub')}
            />
            
            {/* Features onboarding tooltip */}
            {showOnboarding && onboardingStep === 2 && (
              <OnboardingTooltip
                id="features-onboarding"
                title="Quick Access to Features"
                content="Access your most-used features directly from these action cards."
                position="right"
                onDismiss={dismissOnboarding}
                active={true}
              />
            )}
          </div>
          
          {/* Recent activity */}
          <h2 className="text-lg font-medium text-gray-900 pt-2">Recent Activity</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-medium text-gray-700">Recent Activity</h3>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                View All <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
            
            <div className="divide-y divide-gray-100">
              {/* Sample activities would go here */}
              <div className="p-4 flex items-start">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600 mr-3">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-sm text-gray-900">Menu updated with seasonal items</p>
                  <p className="text-xs text-gray-500 mt-1">Today at 2:45 PM by John</p>
                </div>
              </div>
              
              <div className="p-4 flex items-start">
                <div className="bg-green-100 p-2 rounded-full text-green-600 mr-3">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-sm text-gray-900">Staff schedule confirmed for next week</p>
                  <p className="text-xs text-gray-500 mt-1">Today at 11:30 AM by Sarah</p>
                </div>
              </div>
              
              <div className="p-4 flex items-start">
                <div className="bg-purple-100 p-2 rounded-full text-purple-600 mr-3">
                  <Star size={16} />
                </div>
                <div>
                  <p className="text-sm text-gray-900">New 5-star review received</p>
                  <p className="text-xs text-gray-500 mt-1">Yesterday at 8:15 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar with notifications and tasks */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-medium text-gray-700 flex items-center">
                Notifications
                <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {notifications.filter(n => !n.read).length}
                </span>
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Mark all read
              </button>
            </div>
            
            <div>
              {notifications.slice(0, 4).map(notification => (
                <Notification
                  key={notification.id}
                  title={notification.title}
                  time={notification.time}
                  read={notification.read}
                  onClick={() => {}} // Would mark as read and show details
                />
              ))}
            </div>
            
            <div className="p-3 bg-gray-50 border-t text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View all notifications
              </button>
            </div>
          </div>
          
          {/* Tasks */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-medium text-gray-700">Tasks</h3>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Add new
              </button>
            </div>
            
            <div>
              {tasks.map(task => (
                <Task
                  key={task.id}
                  title={task.title}
                  completed={task.completed}
                  onClick={() => {}} // Would toggle completion
                />
              ))}
            </div>
            
            <div className="p-3 bg-gray-50 border-t text-center">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
              </p>
            </div>
          </div>
          
          {/* Getting Started (for new users) */}
          {isNewUser && (
            <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
              <h3 className="font-medium text-blue-800 flex items-center">
                <HelpCircle size={18} className="mr-2" />
                Getting Started
              </h3>
              <p className="text-sm text-blue-700 mt-2">
                Complete these steps to set up your restaurant:
              </p>
              <ul className="mt-3 space-y-2">
                <li className="flex items-center text-sm text-blue-700">
                  <div className="w-5 h-5 rounded-full border border-blue-300 flex items-center justify-center mr-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  Complete your restaurant profile
                </li>
                <li className="flex items-center text-sm text-blue-700">
                  <div className="w-5 h-5 rounded-full border border-blue-300 flex items-center justify-center mr-2"></div>
                  Upload your menu
                </li>
                <li className="flex items-center text-sm text-blue-700">
                  <div className="w-5 h-5 rounded-full border border-blue-300 flex items-center justify-center mr-2"></div>
                  Invite your staff
                </li>
              </ul>
              <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                Continue Setup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;