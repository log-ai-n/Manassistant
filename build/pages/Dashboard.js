"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const AuthContext_1 = require("../contexts/AuthContext");
const RestaurantContext_1 = require("../contexts/RestaurantContext");
const lucide_react_1 = require("lucide-react");
const clsx_1 = __importDefault(require("clsx"));
const react_router_dom_1 = require("react-router-dom");
// Tooltip for progressive onboarding
const OnboardingTooltip = ({ id, title, content, position = 'right', onDismiss, active }) => {
    if (!active)
        return null;
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: (0, clsx_1.default)("absolute z-50 bg-white border border-blue-100 rounded-lg shadow-lg p-3 w-64", positionClasses[position]), "data-tour-id": id, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start mb-2", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium text-gray-900", children: title }), (0, jsx_runtime_1.jsx)("button", { onClick: onDismiss, className: "text-gray-400 hover:text-gray-600", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 16 }) })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600", children: content }), (0, jsx_runtime_1.jsx)("div", { className: (0, clsx_1.default)("absolute w-3 h-3 bg-white transform rotate-45", arrowClasses[position]) })] }));
};
// Stat Card component for key metrics
const StatCard = ({ title, value, change, icon, tooltip, onboardingId, isOnboardingActive }) => {
    const [showTooltip, setShowTooltip] = (0, react_1.useState)(false);
    const changeColor = change.value > 0 ? 'text-green-600' : 'text-red-600';
    return ((0, jsx_runtime_1.jsxs)("div", { className: "relative bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md", children: [tooltip && ((0, jsx_runtime_1.jsxs)("button", { className: "absolute top-3 right-3 text-gray-400 hover:text-gray-600", onMouseEnter: () => setShowTooltip(true), onMouseLeave: () => setShowTooltip(false), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.HelpCircle, { size: 16 }), showTooltip && ((0, jsx_runtime_1.jsx)("div", { className: "absolute right-0 top-full mt-1 bg-gray-800 text-white text-xs rounded py-1 px-2 min-w-[200px] z-10", children: tooltip }))] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-2 rounded-md bg-blue-50 text-blue-600 mr-4", children: icon }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-gray-500", children: title }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-semibold mt-1", children: value })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 flex items-center", children: [(0, jsx_runtime_1.jsxs)("span", { className: (0, clsx_1.default)("text-sm font-medium", changeColor), children: [change.value > 0 ? '+' : '', change.value, "%"] }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs text-gray-500 ml-1.5", children: change.label })] }), onboardingId && isOnboardingActive && ((0, jsx_runtime_1.jsx)(OnboardingTooltip, { id: onboardingId, title: `Track ${title}`, content: `This card shows you the current ${title.toLowerCase()} and how it's changed recently.`, position: "bottom", onDismiss: () => { }, active: isOnboardingActive }))] }));
};
// Action Card component for quick actions
const ActionCard = ({ title, description, icon, onClick, primary = false }) => ((0, jsx_runtime_1.jsx)("div", { className: (0, clsx_1.default)("bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all hover:shadow-md", primary && "border-l-4 border-blue-500"), onClick: onClick, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-2 rounded-md bg-blue-50 text-blue-600 mr-4 flex-shrink-0", children: icon }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium", children: title }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mt-1", children: description })] }), (0, jsx_runtime_1.jsx)("div", { className: "text-blue-600 flex-shrink-0", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowRight, { size: 20 }) })] }) }));
// Notification component
const Notification = ({ title, time, read = false, onClick }) => ((0, jsx_runtime_1.jsx)("div", { className: (0, clsx_1.default)("px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors", !read && "bg-blue-50 hover:bg-blue-100"), onClick: onClick, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start", children: [(0, jsx_runtime_1.jsx)("div", { className: (0, clsx_1.default)("w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0", read ? "bg-gray-300" : "bg-blue-500") }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: (0, clsx_1.default)("text-sm", read ? "text-gray-600" : "text-gray-900 font-medium"), children: title }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 mt-0.5", children: time })] })] }), (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { size: 16, className: "text-gray-400 mt-1" })] }) }));
// Task component
const Task = ({ title, completed = false, onClick }) => ((0, jsx_runtime_1.jsx)("div", { className: "px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors", onClick: onClick, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: (0, clsx_1.default)("w-5 h-5 rounded-full border flex items-center justify-center mr-3 flex-shrink-0", completed ? "bg-green-500 border-green-500" : "border-gray-300"), children: completed && (0, jsx_runtime_1.jsx)("div", { className: "w-2 h-2 bg-white rounded-full" }) }), (0, jsx_runtime_1.jsx)("p", { className: (0, clsx_1.default)("text-sm", completed ? "text-gray-500 line-through" : "text-gray-900"), children: title })] }) }));
const Dashboard = () => {
    const { user } = (0, AuthContext_1.useAuth)();
    const { currentRestaurant, userRestaurants, features } = (0, RestaurantContext_1.useRestaurant)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    // State for onboarding
    const [onboardingStep, setOnboardingStep] = (0, react_1.useState)(0);
    const [showOnboarding, setShowOnboarding] = (0, react_1.useState)(true);
    // Dummy data for demonstration
    const stats = [
        {
            title: 'Average Orders',
            value: '94',
            change: { value: 12, label: 'vs last week' },
            icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Clipboard, { size: 20 }),
            tooltip: 'The average number of orders received per day',
            onboardingId: 'orders-stat'
        },
        {
            title: 'Revenue',
            value: '$3,249',
            change: { value: 8, label: 'vs last week' },
            icon: (0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { size: 20 }),
            tooltip: 'Total revenue generated this week'
        },
        {
            title: 'Customers',
            value: '481',
            change: { value: 3, label: 'vs last week' },
            icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Users, { size: 20 }),
            tooltip: 'Total unique customers served this week'
        },
        {
            title: 'Avg. Serving Time',
            value: '18min',
            change: { value: -5, label: 'vs last week' },
            icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { size: 20 }),
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
    const navigateToFeature = (featureKey) => {
        navigate(`/features/${featureKey}`);
    };
    // Check if user is new (would be from backend in real app)
    const isNewUser = user && new Date(user.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h1", { className: "text-2xl font-bold text-gray-900", children: ["Welcome back, ", (user === null || user === void 0 ? void 0 : user.firstName) || 'Restaurant Manager'] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-600 mt-1", children: ["Here's what's happening at ", (currentRestaurant === null || currentRestaurant === void 0 ? void 0 : currentRestaurant.name) || 'your restaurant', " today."] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 md:mt-0 flex space-x-3 relative", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => navigate('/restaurant/settings'), className: "px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: "Restaurant Settings" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => { }, className: "px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: "View Reports" }), showOnboarding && onboardingStep === 0 && ((0, jsx_runtime_1.jsx)(OnboardingTooltip, { id: "welcome-onboarding", title: "Welcome to Manassist Hub!", content: "This is your restaurant dashboard. We'll show you around the main features.", position: "bottom", onDismiss: moveToNextOnboardingStep, active: true }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative", children: [stats.map((stat, index) => ((0, jsx_runtime_1.jsx)(StatCard, { title: stat.title, value: stat.value, change: stat.change, icon: stat.icon, tooltip: stat.tooltip, onboardingId: stat.onboardingId, isOnboardingActive: showOnboarding && onboardingStep === 1 && index === 0 }, index))), showOnboarding && onboardingStep === 1 && ((0, jsx_runtime_1.jsx)("div", { className: "absolute bottom-full left-0 mb-2", children: (0, jsx_runtime_1.jsx)("button", { onClick: moveToNextOnboardingStep, className: "px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white shadow-md hover:bg-blue-700", children: "Next: Explore Features" }) }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "lg:col-span-2 space-y-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-medium text-gray-900", children: "Quick Actions" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 relative", children: [(0, jsx_runtime_1.jsx)(ActionCard, { title: "Update Menu", description: "Add new items or edit existing ones", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Clipboard, { size: 20 }), onClick: () => navigateToFeature('allergenie'), primary: true }), (0, jsx_runtime_1.jsx)(ActionCard, { title: "Review Analytics", description: "Get insights into your restaurant's performance", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.PieChart, { size: 20 }), onClick: () => { } }), (0, jsx_runtime_1.jsx)(ActionCard, { title: "Manage Staff", description: "Schedule and assign roles to your team", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Users, { size: 20 }), onClick: () => navigate('/team') }), (0, jsx_runtime_1.jsx)(ActionCard, { title: "Customer Feedback", description: "View and respond to recent reviews", icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Star, { size: 20 }), onClick: () => navigateToFeature('review_hub') }), showOnboarding && onboardingStep === 2 && ((0, jsx_runtime_1.jsx)(OnboardingTooltip, { id: "features-onboarding", title: "Quick Access to Features", content: "Access your most-used features directly from these action cards.", position: "right", onDismiss: dismissOnboarding, active: true }))] }), (0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-medium text-gray-900 pt-2", children: "Recent Activity" }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-sm overflow-hidden", children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-4 border-b bg-gray-50 flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-medium text-gray-700", children: "Recent Activity" }), (0, jsx_runtime_1.jsxs)("button", { className: "text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center", children: ["View All ", (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { size: 16, className: "ml-1" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "divide-y divide-gray-100", children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-4 flex items-start", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-blue-100 p-2 rounded-full text-blue-600 mr-3", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { size: 16 }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-900", children: "Menu updated with seasonal items" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 mt-1", children: "Today at 2:45 PM by John" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-4 flex items-start", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-green-100 p-2 rounded-full text-green-600 mr-3", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Users, { size: 16 }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-900", children: "Staff schedule confirmed for next week" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 mt-1", children: "Today at 11:30 AM by Sarah" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-4 flex items-start", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-purple-100 p-2 rounded-full text-purple-600 mr-3", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Star, { size: 16 }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-900", children: "New 5-star review received" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 mt-1", children: "Yesterday at 8:15 PM" })] })] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-sm overflow-hidden", children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-4 border-b bg-gray-50 flex justify-between items-center", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "font-medium text-gray-700 flex items-center", children: ["Notifications", (0, jsx_runtime_1.jsx)("span", { className: "ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full", children: notifications.filter(n => !n.read).length })] }), (0, jsx_runtime_1.jsx)("button", { className: "text-sm text-blue-600 hover:text-blue-800 font-medium", children: "Mark all read" })] }), (0, jsx_runtime_1.jsx)("div", { children: notifications.slice(0, 4).map(notification => ((0, jsx_runtime_1.jsx)(Notification, { title: notification.title, time: notification.time, read: notification.read, onClick: () => { } }, notification.id))) }), (0, jsx_runtime_1.jsx)("div", { className: "p-3 bg-gray-50 border-t text-center", children: (0, jsx_runtime_1.jsx)("button", { className: "text-sm text-blue-600 hover:text-blue-800 font-medium", children: "View all notifications" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-sm overflow-hidden", children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-4 border-b bg-gray-50 flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-medium text-gray-700", children: "Tasks" }), (0, jsx_runtime_1.jsx)("button", { className: "text-sm text-blue-600 hover:text-blue-800 font-medium", children: "Add new" })] }), (0, jsx_runtime_1.jsx)("div", { children: tasks.map(task => ((0, jsx_runtime_1.jsx)(Task, { title: task.title, completed: task.completed, onClick: () => { } }, task.id))) }), (0, jsx_runtime_1.jsxs)("div", { className: "p-3 bg-gray-50 border-t text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-full bg-gray-200 rounded-full h-1.5", children: (0, jsx_runtime_1.jsx)("div", { className: "bg-blue-600 h-1.5 rounded-full", style: { width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` } }) }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-500 mt-2", children: [tasks.filter(t => t.completed).length, " of ", tasks.length, " tasks completed"] })] })] }), isNewUser && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-blue-50 rounded-lg p-5 border border-blue-100", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "font-medium text-blue-800 flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.HelpCircle, { size: 18, className: "mr-2" }), "Getting Started"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-blue-700 mt-2", children: "Complete these steps to set up your restaurant:" }), (0, jsx_runtime_1.jsxs)("ul", { className: "mt-3 space-y-2", children: [(0, jsx_runtime_1.jsxs)("li", { className: "flex items-center text-sm text-blue-700", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-5 h-5 rounded-full border border-blue-300 flex items-center justify-center mr-2", children: (0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3 bg-blue-500 rounded-full" }) }), "Complete your restaurant profile"] }), (0, jsx_runtime_1.jsxs)("li", { className: "flex items-center text-sm text-blue-700", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-5 h-5 rounded-full border border-blue-300 flex items-center justify-center mr-2" }), "Upload your menu"] }), (0, jsx_runtime_1.jsxs)("li", { className: "flex items-center text-sm text-blue-700", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-5 h-5 rounded-full border border-blue-300 flex items-center justify-center mr-2" }), "Invite your staff"] })] }), (0, jsx_runtime_1.jsx)("button", { className: "mt-4 w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors", children: "Continue Setup" })] }))] })] })] }));
};
exports.default = Dashboard;
