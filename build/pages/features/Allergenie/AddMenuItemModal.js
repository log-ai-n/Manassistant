"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const react_1 = __importStar(require("react"));
const RestaurantContext_1 = require("../../../contexts/RestaurantContext");
const supabase_1 = require("../../../lib/supabase");
const lucide_react_1 = require("lucide-react");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("zod");
const zod_2 = require("@hookform/resolvers/zod");
const clsx_1 = __importDefault(require("clsx"));
const menuItemSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().min(1, 'Category is required'),
    price: zod_1.z.number().min(0, 'Price must be 0 or greater').optional(),
    active: zod_1.z.boolean().default(true),
});
const AddMenuItemModal = ({ onClose, onSuccess }) => {
    const { currentRestaurant } = (0, RestaurantContext_1.useRestaurant)();
    const [allergens, setAllergens] = (0, react_1.useState)([]);
    const [selectedAllergens, setSelectedAllergens] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const { register, handleSubmit, formState: { errors }, } = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_2.zodResolver)(menuItemSchema),
        defaultValues: {
            active: true,
        }
    });
    react_1.default.useEffect(() => {
        fetchAllergens();
    }, []);
    const fetchAllergens = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { data, error } = yield supabase_1.supabase
                .from('allergens')
                .select('*')
                .order('name');
            if (error)
                throw error;
            setAllergens(data || []);
        }
        catch (err) {
            console.error('Error fetching allergens:', err);
            setError('Failed to load allergens');
        }
    });
    const handleAllergenToggle = (allergen) => {
        setSelectedAllergens(prev => {
            const exists = prev.find(a => a.id === allergen.id);
            if (exists) {
                return prev.filter(a => a.id !== allergen.id);
            }
            else {
                return [...prev, { id: allergen.id, name: allergen.name, severity: 1 }];
            }
        });
    };
    const handleSeverityChange = (allergenId, severity) => {
        setSelectedAllergens(prev => prev.map(a => a.id === allergenId ? Object.assign(Object.assign({}, a), { severity }) : a));
    };
    const onSubmit = (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (!currentRestaurant)
            return;
        setLoading(true);
        setError(null);
        try {
            // Insert menu item
            const { data: menuItem, error: menuError } = yield supabase_1.supabase
                .from('menu_items')
                .insert(Object.assign(Object.assign({}, data), { restaurant_id: currentRestaurant.id }))
                .select()
                .single();
            if (menuError)
                throw menuError;
            // Insert allergen associations
            if (selectedAllergens.length > 0) {
                const allergenAssociations = selectedAllergens.map(allergen => ({
                    menu_item_id: menuItem.id,
                    allergen_id: allergen.id,
                    severity_level: allergen.severity,
                }));
                const { error: allergenError } = yield supabase_1.supabase
                    .from('menu_allergens')
                    .insert(allergenAssociations);
                if (allergenError)
                    throw allergenError;
            }
            onSuccess();
            onClose();
        }
        catch (err) {
            console.error('Error adding menu item:', err);
            setError('Failed to add menu item');
        }
        finally {
            setLoading(false);
        }
    });
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-xl max-w-2xl w-full p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-medium text-gray-900", children: "Add Menu Item" }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-500", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-6 w-6" }) })] }), error && ((0, jsx_runtime_1.jsx)("div", { className: "mb-4 bg-red-50 border-l-4 border-red-400 p-4", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-700", children: error }) })), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: "Name *" }), (0, jsx_runtime_1.jsx)("input", Object.assign({ type: "text", id: "name" }, register('name'), { className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" })), errors.name && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-red-600", children: errors.name.message }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700", children: "Description" }), (0, jsx_runtime_1.jsx)("textarea", Object.assign({ id: "description", rows: 3 }, register('description'), { className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "category", className: "block text-sm font-medium text-gray-700", children: "Category *" }), (0, jsx_runtime_1.jsx)("input", Object.assign({ type: "text", id: "category" }, register('category'), { className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" })), errors.category && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-red-600", children: errors.category.message }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "price", className: "block text-sm font-medium text-gray-700", children: "Price" }), (0, jsx_runtime_1.jsx)("input", Object.assign({ type: "number", id: "price", step: "0.01", min: "0" }, register('price', { valueAsNumber: true }), { className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" })), errors.price && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-red-600", children: errors.price.message }))] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Allergens" }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: allergens.map((allergen) => {
                                        var _a;
                                        return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsxs)("label", { className: (0, clsx_1.default)('inline-flex items-center px-3 py-2 rounded-md text-sm cursor-pointer w-full', selectedAllergens.some(a => a.id === allergen.id)
                                                        ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'), children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", className: "sr-only", checked: selectedAllergens.some(a => a.id === allergen.id), onChange: () => handleAllergenToggle(allergen) }), (0, jsx_runtime_1.jsx)("span", { children: allergen.name })] }), selectedAllergens.some(a => a.id === allergen.id) && ((0, jsx_runtime_1.jsx)("select", { value: ((_a = selectedAllergens.find(a => a.id === allergen.id)) === null || _a === void 0 ? void 0 : _a.severity) || 1, onChange: (e) => handleSeverityChange(allergen.id, parseInt(e.target.value)), className: "block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500", children: [1, 2, 3, 4, 5].map(level => ((0, jsx_runtime_1.jsxs)("option", { value: level, children: ["Severity: ", level] }, level))) }))] }, allergen.id));
                                    }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("input", Object.assign({ type: "checkbox", id: "active" }, register('active'), { className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" })), (0, jsx_runtime_1.jsx)("label", { htmlFor: "active", className: "ml-2 block text-sm text-gray-900", children: "Active" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end space-x-3", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: onClose, className: "inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: loading, className: "inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50", children: loading ? 'Adding...' : 'Add Menu Item' })] })] })] }) }));
};
exports.default = AddMenuItemModal;
