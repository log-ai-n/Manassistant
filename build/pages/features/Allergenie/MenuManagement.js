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
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const RestaurantContext_1 = require("../../../contexts/RestaurantContext");
const supabase_1 = require("../../../lib/supabase");
const lucide_react_1 = require("lucide-react");
const clsx_1 = __importDefault(require("clsx"));
const MenuManagement = ({ onAddClick, onImportClick, refreshTrigger }) => {
    const { currentRestaurant } = (0, RestaurantContext_1.useRestaurant)();
    const [menuItems, setMenuItems] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (currentRestaurant) {
            fetchMenuItems();
        }
    }, [currentRestaurant, refreshTrigger]);
    const fetchMenuItems = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!currentRestaurant)
            return;
        try {
            const { data, error } = yield supabase_1.supabase
                .from('menu_items')
                .select(`
          *,
          menu_allergens (
            id,
            allergen_id,
            severity,
            allergens (
              id,
              name
            )
          )
        `)
                .eq('restaurant_id', currentRestaurant.id)
                .order('name');
            if (error)
                throw error;
            setMenuItems(data || []);
        }
        catch (err) {
            console.error('Error fetching menu items:', err);
            setError('Failed to load menu items');
        }
        finally {
            setLoading(false);
        }
    });
    if (loading) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-6", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [error && ((0, jsx_runtime_1.jsx)("div", { className: "bg-red-50 border-l-4 border-red-400 p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "h-5 w-5 text-red-400" }), (0, jsx_runtime_1.jsx)("div", { className: "ml-3", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-700", children: error }) })] }) })), (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-4", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: onAddClick, className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }), "Add Menu Item"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: onImportClick, className: "inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { className: "h-4 w-4 mr-2" }), "Import Menu"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "bg-white shadow overflow-hidden sm:rounded-md", children: menuItems.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-12", children: (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500", children: "No menu items yet. Add your first item or import a menu." }) })) : ((0, jsx_runtime_1.jsx)("ul", { className: "divide-y divide-gray-200", children: menuItems.map((item) => ((0, jsx_runtime_1.jsx)("li", { className: "px-4 py-4 sm:px-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900", children: item.name }), item.description && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-gray-500", children: item.description })), item.menu_allergens && item.menu_allergens.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "mt-2 flex flex-wrap gap-2", children: item.menu_allergens.map((allergen) => {
                                                var _a;
                                                return ((0, jsx_runtime_1.jsx)("span", { className: (0, clsx_1.default)('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', {
                                                        'bg-red-100 text-red-800': allergen.severity === 'High',
                                                        'bg-yellow-100 text-yellow-800': allergen.severity === 'Medium',
                                                        'bg-green-100 text-green-800': allergen.severity === 'Low'
                                                    }), children: (_a = allergen.allergens) === null || _a === void 0 ? void 0 : _a.name }, allergen.id));
                                            }) }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-4 flex items-center space-x-4", children: [item.price && ((0, jsx_runtime_1.jsxs)("span", { className: "text-lg font-medium text-gray-900", children: ["$", item.price.toFixed(2)] })), (0, jsx_runtime_1.jsx)("span", { className: (0, clsx_1.default)('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', item.active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'), children: item.active ? 'Active' : 'Inactive' })] })] }) }, item.id))) })) })] }));
};
exports.default = MenuManagement;
