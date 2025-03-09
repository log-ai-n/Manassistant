"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const RestaurantContext_1 = require("../../contexts/RestaurantContext");
const lucide_react_1 = require("lucide-react");
const Allergenie = () => {
    const { features } = (0, RestaurantContext_1.useRestaurant)();
    const isEnabled = features.some(f => f.feature_key === 'allergenie' && f.is_enabled);
    if (!isEnabled) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "h-5 w-5 text-yellow-400" }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-3", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-yellow-800", children: "Feature Not Enabled" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-sm text-yellow-700", children: "The Allergenie feature is currently disabled. Please enable it in Restaurant Settings to access this feature." })] })] }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-8", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold text-gray-900", children: "Allergenie" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Menu and allergen management system" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white shadow rounded-lg p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-medium text-gray-900 mb-4", children: "Menu Management" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 mb-4", children: "Create and manage your menu items with detailed allergen information." }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("button", { className: "w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: "Add Menu Item" }), (0, jsx_runtime_1.jsx)("button", { className: "w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: "Import Menu" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white shadow rounded-lg p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-medium text-gray-900 mb-4", children: "Allergen Lookup" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 mb-4", children: "Quick access to allergen information for your menu items." }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "search", className: "block text-sm font-medium text-gray-700", children: "Search Menu Items" }), (0, jsx_runtime_1.jsx)("div", { className: "mt-1", children: (0, jsx_runtime_1.jsx)("input", { type: "text", name: "search", id: "search", className: "shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md", placeholder: "Enter menu item name..." }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700", children: "Common Allergens" }), (0, jsx_runtime_1.jsx)("div", { className: "mt-2 grid grid-cols-2 gap-2", children: ['Gluten', 'Dairy', 'Nuts', 'Shellfish', 'Eggs', 'Soy'].map((allergen) => ((0, jsx_runtime_1.jsxs)("label", { className: "inline-flex items-center", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), (0, jsx_runtime_1.jsx)("span", { className: "ml-2 text-sm text-gray-600", children: allergen })] }, allergen))) })] })] })] })] })] }));
};
exports.default = Allergenie;
