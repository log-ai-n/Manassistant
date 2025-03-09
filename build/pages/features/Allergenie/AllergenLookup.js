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
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const RestaurantContext_1 = require("../../../contexts/RestaurantContext");
const supabase_1 = require("../../../lib/supabase");
const lucide_react_1 = require("lucide-react");
const AllergenLookup = () => {
    const { currentRestaurant } = (0, RestaurantContext_1.useRestaurant)();
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [selectedAllergens, setSelectedAllergens] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [results, setResults] = (0, react_1.useState)([]);
    const commonAllergens = [
        'Milk',
        'Eggs',
        'Fish',
        'Shellfish',
        'Tree Nuts',
        'Peanuts',
        'Wheat',
        'Soybeans'
    ];
    const handleSearch = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!currentRestaurant)
            return;
        if (!searchTerm && selectedAllergens.length === 0)
            return;
        setLoading(true);
        setError(null);
        try {
            let query = supabase_1.supabase
                .from('menu_items')
                .select(`
          *,
          menu_allergens (
            allergens (
              id,
              name,
              severity_level
            )
          )
        `)
                .eq('restaurant_id', currentRestaurant.id)
                .eq('active', true);
            if (searchTerm) {
                query = query.ilike('name', `%${searchTerm}%`);
            }
            const { data, error } = yield query;
            if (error)
                throw error;
            // Filter by selected allergens if any
            const filteredData = selectedAllergens.length > 0
                ? data.filter(item => item.menu_allergens.some((ma) => selectedAllergens.includes(ma.allergens.name)))
                : data;
            setResults(filteredData);
        }
        catch (err) {
            console.error('Error searching menu items:', err);
            setError('Failed to search menu items');
        }
        finally {
            setLoading(false);
        }
    });
    const toggleAllergen = (allergen) => {
        setSelectedAllergens(prev => prev.includes(allergen)
            ? prev.filter(a => a !== allergen)
            : [...prev, allergen]);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [error && ((0, jsx_runtime_1.jsx)("div", { className: "bg-red-50 border-l-4 border-red-400 p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "h-5 w-5 text-red-400" }), (0, jsx_runtime_1.jsx)("div", { className: "ml-3", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-700", children: error }) })] }) })), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white shadow rounded-lg p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-6", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "search", className: "block text-sm font-medium text-gray-700", children: "Search Menu Items" }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-1 relative rounded-md shadow-sm", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", name: "search", id: "search", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md", placeholder: "Enter menu item name..." }), (0, jsx_runtime_1.jsx)("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "h-5 w-5 text-gray-400" }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-6", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Filter by Allergens" }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2", children: commonAllergens.map((allergen) => ((0, jsx_runtime_1.jsxs)("label", { className: `inline-flex items-center px-3 py-2 rounded-md text-sm cursor-pointer ${selectedAllergens.includes(allergen)
                                        ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", className: "sr-only", checked: selectedAllergens.includes(allergen), onChange: () => toggleAllergen(allergen) }), (0, jsx_runtime_1.jsx)("span", { children: allergen })] }, allergen))) })] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleSearch, disabled: loading, className: "w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50", children: loading ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" }), "Searching..."] })) : ('Search') })] }), results.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "bg-white shadow overflow-hidden sm:rounded-md", children: (0, jsx_runtime_1.jsx)("ul", { className: "divide-y divide-gray-200", children: results.map((item) => ((0, jsx_runtime_1.jsx)("li", { className: "px-4 py-4 sm:px-6", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900", children: item.name }), item.description && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-gray-500", children: item.description })), item.menu_allergens.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "mt-2 flex flex-wrap gap-2", children: item.menu_allergens.map((ma) => ((0, jsx_runtime_1.jsx)("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800", children: ma.allergens.name }, ma.allergens.id))) }))] }) }, item.id))) }) }))] }));
};
exports.default = AllergenLookup;
