"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Layout = Layout;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../contexts/AuthContext");
const RestaurantContext_1 = require("../contexts/RestaurantContext");
const lucide_react_1 = require("lucide-react");
const clsx_1 = __importDefault(require("clsx"));
// Main navigation items with consistent naming and icons
const navItems = [
    { name: 'Dashboard', path: '/', icon: lucide_react_1.Home, description: 'View restaurant performance at a glance' },
    { name: 'Activity', path: '/activity', icon: lucide_react_1.Activity, description: 'Track recent events and actions' },
    { name: 'Team', path: '/team', icon: lucide_react_1.Users, description: 'Manage restaurant staff and permissions' },
    { name: 'Settings', path: '/settings', icon: lucide_react_1.Settings, description: 'Configure restaurant settings' },
];
// Reusable tooltip component
const Tooltip = ({ children, content, enabled = true }) => {
    const [isVisible, setIsVisible] = (0, react_1.useState)(false);
    if (!enabled)
        return children;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "relative", onMouseEnter: () => setIsVisible(true), onMouseLeave: () => setIsVisible(false), children: [children, isVisible && ((0, jsx_runtime_1.jsxs)("div", { className: "absolute left-full ml-2 top-0 z-10 bg-gray-800 text-white text-xs rounded py-1 px-2 min-w-[150px] whitespace-normal", children: [content, (0, jsx_runtime_1.jsx)("div", { className: "absolute top-2 -left-1 w-2 h-2 bg-gray-800 transform rotate-45" })] }))] }));
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
    return ((0, jsx_runtime_1.jsx)("button", { onClick: disabled ? undefined : onClick, className: (0, clsx_1.default)(baseClasses, variantClasses[variant], sizeClasses[size], disabledClasses, className), disabled: disabled, children: children }));
};
function Layout({ children }) {
    const { user, signOut } = (0, AuthContext_1.useAuth)();
    const { currentRestaurant, userRestaurants, setCurrentRestaurant, userRole, features } = (0, RestaurantContext_1.useRestaurant)();
    const location = (0, react_router_dom_1.useLocation)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [isSidebarOpen, setIsSidebarOpen] = (0, react_1.useState)(true);
    const [restaurantDropdownOpen, setRestaurantDropdownOpen] = (0, react_1.useState)(false);
    const [showTooltips, setShowTooltips] = (0, react_1.useState)(true); // Control tooltips for onboarding
    // Handle user sign out
    const handleSignOut = () => __awaiter(this, void 0, void 0, function* () {
        yield signOut();
        navigate('/login');
    });
    // Handle restaurant switching
    const handleRestaurantChange = (restaurant) => {
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-gray-50 flex", children: [(0, jsx_runtime_1.jsxs)("div", { className: (0, clsx_1.default)('fixed inset-y-0 left-0 z-10 bg-white border-r transform transition-all duration-200 ease-in-out flex flex-col', isSidebarOpen ? 'w-64' : 'w-20'), children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-4 border-b flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("h1", { className: (0, clsx_1.default)("font-semibold transition-opacity", isSidebarOpen ? "text-xl opacity-100" : "text-lg opacity-0 w-0 overflow-hidden"), children: "Manassist Hub" }), (0, jsx_runtime_1.jsx)("button", { onClick: toggleSidebar, className: "p-1 rounded-md hover:bg-gray-100 text-gray-500", "aria-label": isSidebarOpen ? "Collapse sidebar" : "Expand sidebar", children: isSidebarOpen ? (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronsLeft, { size: 20 }) : (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronsRight, { size: 20 }) })] }), currentRestaurant && ((0, jsx_runtime_1.jsxs)("div", { className: "px-4 py-2 border-b", children: [(0, jsx_runtime_1.jsxs)("div", { onClick: () => setRestaurantDropdownOpen(!restaurantDropdownOpen), className: "flex items-center justify-between cursor-pointer p-2 rounded-md hover:bg-gray-100", children: [(0, jsx_runtime_1.jsxs)("div", { className: (0, clsx_1.default)("flex items-center", !isSidebarOpen && "justify-center w-full"), children: [(0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-sm", children: currentRestaurant.name.charAt(0) }), isSidebarOpen && ((0, jsx_runtime_1.jsx)("span", { className: "ml-2 text-sm font-medium truncate max-w-[160px]", children: currentRestaurant.name }))] }), isSidebarOpen && (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { size: 16 })] }), restaurantDropdownOpen && isSidebarOpen && ((0, jsx_runtime_1.jsx)("div", { className: "mt-2 bg-white border rounded-md shadow-lg py-1 absolute z-20 w-56", children: userRestaurants.map((restaurant) => ((0, jsx_runtime_1.jsx)("div", { onClick: () => handleRestaurantChange(restaurant), className: (0, clsx_1.default)("px-3 py-2 text-sm cursor-pointer hover:bg-gray-100", restaurant.id === currentRestaurant.id && "bg-blue-50 text-blue-600"), children: restaurant.name }, restaurant.id))) }))] })), (0, jsx_runtime_1.jsxs)("nav", { className: "flex-1 py-4 space-y-1 overflow-y-auto", children: [navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return ((0, jsx_runtime_1.jsx)(Tooltip, { content: item.description, enabled: showTooltips, children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.Link, { to: item.path, className: (0, clsx_1.default)('flex items-center py-2 transition-colors', isSidebarOpen ? 'px-4 mx-3 rounded-md' : 'px-0 mx-0 justify-center', isActive
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-600 hover:bg-gray-50'), children: [(0, jsx_runtime_1.jsx)(Icon, { size: 20, className: (0, clsx_1.default)(!isSidebarOpen && 'mx-auto') }), isSidebarOpen && (0, jsx_runtime_1.jsx)("span", { className: "ml-3 text-sm", children: item.name })] }) }, item.path));
                            }), showTooltips && isSidebarOpen && ((0, jsx_runtime_1.jsx)("div", { className: "mx-4 mt-4 p-3 bg-blue-50 rounded-md", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Info, { size: 16, className: "text-blue-500 mt-0.5 flex-shrink-0" }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs text-blue-800", children: "Hover over menu items to learn more about each section" }), (0, jsx_runtime_1.jsx)("button", { onClick: dismissTooltips, className: "text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium", children: "Don't show again" })] })] }) }))] }), user && ((0, jsx_runtime_1.jsx)("div", { className: "p-4 border-t", children: (0, jsx_runtime_1.jsxs)("div", { className: (0, clsx_1.default)("flex items-center", !isSidebarOpen && "justify-center"), children: [(0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center", children: user.email.charAt(0).toUpperCase() }), isSidebarOpen && ((0, jsx_runtime_1.jsxs)("div", { className: "ml-3 flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-900 truncate", children: user.email }), (0, jsx_runtime_1.jsxs)("button", { onClick: handleSignOut, className: "text-xs text-gray-500 hover:text-gray-700 flex items-center mt-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.LogOut, { size: 12, className: "mr-1" }), "Sign out"] })] }))] }) }))] }), (0, jsx_runtime_1.jsx)("div", { className: "lg:hidden", children: (0, jsx_runtime_1.jsxs)("div", { className: "fixed top-0 left-0 right-0 z-20 bg-white border-b p-4 flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("button", { onClick: toggleSidebar, className: "p-2 rounded-md hover:bg-gray-100", children: isSidebarOpen ? (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 24 }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Menu, { size: 24 }) }), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold", children: "Manassist Hub" })] }) }), (0, jsx_runtime_1.jsx)("main", { className: (0, clsx_1.default)('flex-1 transition-all duration-200 ease-in-out p-6', isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20', 'mt-16 lg:mt-0' // Add top margin for mobile header
                ), children: children || (0, jsx_runtime_1.jsx)(react_router_dom_1.Outlet, {}) })] }));
}
