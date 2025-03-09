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
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const RestaurantContext_1 = require("../../contexts/RestaurantContext");
const supabase_1 = require("../../lib/supabase");
const lucide_react_1 = require("lucide-react");
const react_copy_to_clipboard_1 = require("react-copy-to-clipboard");
const featureMetadata = {
    allergenie: {
        name: 'Allergenie',
        description: 'Menu and allergen management system with real-time lookup for staff and customers',
        category: 'foh',
        status: 'active',
        defaultEnabled: true
    },
    foh_chatbot: {
        name: 'FOH Chatbot',
        description: 'Guest-facing support for menu inquiries with QR code access',
        category: 'foh',
        status: 'coming_soon'
    },
    guest_simulator: {
        name: 'GuestSimulator',
        description: 'Staff training simulator with synthetic customers and menu knowledge tests',
        category: 'foh',
        status: 'coming_soon'
    },
    boh_chatbot: {
        name: 'BOH Chatbot',
        description: 'Voice-activated assistance for kitchen staff with recipe guides and troubleshooting',
        category: 'boh',
        status: 'coming_soon'
    },
    menu_trainer: {
        name: 'Menu Trainer',
        description: 'Interactive training modules for staff to learn menu items and ingredients',
        category: 'boh',
        status: 'coming_soon'
    },
    waste_optimizer: {
        name: 'Waste Optimizer',
        description: 'AI-powered waste reduction and inventory optimization system',
        category: 'boh',
        status: 'coming_soon'
    },
    menu_planning: {
        name: 'Menu Planning',
        description: 'AI-powered menu planning using historical data and recipes to create special events and new menu items based on past successes',
        category: 'management',
        status: 'coming_soon'
    },
    review_hub: {
        name: 'Review Hub',
        description: 'Centralize and analyze customer feedback across platforms to improve service and menu offerings',
        category: 'management',
        status: 'coming_soon'
    },
    store_logai: {
        name: 'Store LogAI',
        description: 'Automate shift logs, waste tracking, and generate improvement suggestions',
        category: 'management',
        status: 'coming_soon'
    }
};
const categoryNames = {
    foh: 'Front of House',
    boh: 'Back of House',
    management: 'Management & Analytics'
};
const RestaurantSettings = () => {
    const { currentRestaurant, updateRestaurant, userRole } = (0, RestaurantContext_1.useRestaurant)();
    const [name, setName] = (0, react_1.useState)((currentRestaurant === null || currentRestaurant === void 0 ? void 0 : currentRestaurant.name) || '');
    const [address, setAddress] = (0, react_1.useState)((currentRestaurant === null || currentRestaurant === void 0 ? void 0 : currentRestaurant.address) || '');
    const [phone, setPhone] = (0, react_1.useState)((currentRestaurant === null || currentRestaurant === void 0 ? void 0 : currentRestaurant.phone) || '');
    const [active, setActive] = (0, react_1.useState)((currentRestaurant === null || currentRestaurant === void 0 ? void 0 : currentRestaurant.active) || true);
    const [copied, setCopied] = (0, react_1.useState)(false);
    const [features, setFeatures] = (0, react_1.useState)([]);
    const [notifyFeatures, setNotifyFeatures] = (0, react_1.useState)(new Set());
    const [isUpdating, setIsUpdating] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [success, setSuccess] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const canEdit = userRole === 'owner' || userRole === 'manager';
    react_1.default.useEffect(() => {
        if (currentRestaurant) {
            setName(currentRestaurant.name);
            setAddress(currentRestaurant.address || '');
            setPhone(currentRestaurant.phone || '');
            setActive(currentRestaurant.active);
            fetchFeatures();
        }
    }, [currentRestaurant]);
    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const fetchFeatures = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!currentRestaurant)
            return;
        setLoading(true);
        try {
            const { data, error } = yield supabase_1.supabase
                .from('restaurant_features')
                .select('*')
                .eq('restaurant_id', currentRestaurant.id);
            if (error)
                throw error;
            const enhancedFeatures = data.map((feature) => {
                var _a, _b;
                return (Object.assign(Object.assign({}, feature), { display_name: ((_a = featureMetadata[feature.feature_key]) === null || _a === void 0 ? void 0 : _a.name) || feature.feature_key, description: ((_b = featureMetadata[feature.feature_key]) === null || _b === void 0 ? void 0 : _b.description) || '' }));
            });
            setFeatures(enhancedFeatures);
        }
        catch (error) {
            console.error('Error fetching features:', error);
            setError('Failed to load features');
        }
        finally {
            setLoading(false);
        }
    });
    const handleSubmit = (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        if (!currentRestaurant)
            return;
        if (!name.trim()) {
            setError('Restaurant name is required');
            return;
        }
        setIsUpdating(true);
        setError(null);
        setSuccess(null);
        try {
            const updates = {
                name,
                address,
                phone,
                active,
            };
            const { error } = yield updateRestaurant(currentRestaurant.id, updates);
            if (error) {
                setError(error.message);
            }
            else {
                setSuccess('Restaurant settings updated successfully');
            }
        }
        catch (err) {
            setError('An unexpected error occurred');
            console.error(err);
        }
        finally {
            setIsUpdating(false);
        }
    });
    const handleToggleFeature = (featureId, isEnabled) => __awaiter(void 0, void 0, void 0, function* () {
        if (!currentRestaurant || !canEdit)
            return;
        setIsUpdating(true);
        setError(null);
        setSuccess(null);
        try {
            const { error } = yield supabase_1.supabase
                .from('restaurant_features')
                .update({ is_enabled: isEnabled })
                .eq('id', featureId);
            if (error)
                throw error;
            setFeatures(features.map((f) => (f.id === featureId ? Object.assign(Object.assign({}, f), { is_enabled: isEnabled }) : f)));
            setSuccess('Feature updated successfully');
        }
        catch (err) {
            setError('Failed to update feature');
            console.error(err);
        }
        finally {
            setIsUpdating(false);
        }
    });
    const handleNotifyFeature = (featureKey) => {
        const newNotifyFeatures = new Set(notifyFeatures);
        if (notifyFeatures.has(featureKey)) {
            newNotifyFeatures.delete(featureKey);
        }
        else {
            newNotifyFeatures.add(featureKey);
        }
        setNotifyFeatures(newNotifyFeatures);
        setSuccess('You will be notified when this feature becomes available');
    };
    const groupedFeatures = Object.entries(featureMetadata).reduce((acc, [key, meta]) => {
        if (!acc[meta.category]) {
            acc[meta.category] = [];
        }
        const existingFeature = features.find(f => f.feature_key === key);
        acc[meta.category].push(Object.assign({ id: (existingFeature === null || existingFeature === void 0 ? void 0 : existingFeature.id) || key, feature_key: key, is_enabled: (existingFeature === null || existingFeature === void 0 ? void 0 : existingFeature.is_enabled) || false }, meta));
        return acc;
    }, {});
    if (!currentRestaurant) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-12", children: (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500", children: "Please select a restaurant first" }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-8", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold text-gray-900", children: "Restaurant Settings" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Manage your restaurant details and features" })] }), error && ((0, jsx_runtime_1.jsx)("div", { className: "mb-4 bg-red-50 border-l-4 border-red-400 p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "h-5 w-5 text-red-400" }), (0, jsx_runtime_1.jsx)("div", { className: "ml-3", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-700", children: error }) })] }) })), success && ((0, jsx_runtime_1.jsx)("div", { className: "mb-4 bg-green-50 border-l-4 border-green-400 p-4", children: (0, jsx_runtime_1.jsx)("div", { className: "flex", children: (0, jsx_runtime_1.jsx)("div", { className: "ml-3", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-green-700", children: success }) }) }) })), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white shadow rounded-lg p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-medium text-gray-900 mb-4", children: "Restaurant Details" }), (0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: "Restaurant Name *" }), (0, jsx_runtime_1.jsx)("input", { type: "text", id: "name", value: name, onChange: (e) => setName(e.target.value), className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", required: true, disabled: !canEdit })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "address", className: "block text-sm font-medium text-gray-700", children: "Address" }), (0, jsx_runtime_1.jsx)("input", { type: "text", id: "address", value: address, onChange: (e) => setAddress(e.target.value), className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", disabled: !canEdit })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "phone", className: "block text-sm font-medium text-gray-700", children: "Phone Number" }), (0, jsx_runtime_1.jsx)("input", { type: "text", id: "phone", value: phone, onChange: (e) => setPhone(e.target.value), className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", disabled: !canEdit })] }), (0, jsx_runtime_1.jsxs)("div", { className: "border-t border-gray-200 pt-6", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Team Access Settings" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700", children: "Restaurant Code" }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-1 flex rounded-md shadow-sm", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: (currentRestaurant === null || currentRestaurant === void 0 ? void 0 : currentRestaurant.restaurant_code) || '', className: "flex-1 block w-full rounded-l-md border-gray-300 bg-gray-50 sm:text-sm", disabled: true }), (0, jsx_runtime_1.jsx)(react_copy_to_clipboard_1.CopyToClipboard, { text: (currentRestaurant === null || currentRestaurant === void 0 ? void 0 : currentRestaurant.restaurant_code) || '', onCopy: handleCopy, children: (0, jsx_runtime_1.jsx)("button", { type: "button", className: "relative inline-flex items-center px-4 py-2 -ml-px space-x-2 text-sm font-medium border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500", children: copied ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Check, { className: "h-4 w-4 text-green-500" }), (0, jsx_runtime_1.jsx)("span", { className: "text-green-500", children: "Copied!" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { className: "h-4 w-4 text-gray-400" }), (0, jsx_runtime_1.jsx)("span", { children: "Copy" })] })) }) })] }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-sm text-gray-500", children: "This code will be used by your staff members to access your restaurant." })] })] }), userRole === 'owner' && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("input", { id: "active", type: "checkbox", checked: active, onChange: (e) => setActive(e.target.checked), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded", disabled: !canEdit }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "active", className: "ml-2 block text-sm text-gray-900", children: "Restaurant is active" })] }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-gray-500", children: "Inactive restaurants won't be accessible to staff members." })] })), canEdit && ((0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: isUpdating, className: "inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50", children: isUpdating ? 'Saving...' : 'Save Changes' }) }))] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white shadow rounded-lg p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-medium text-gray-900 mb-2", children: "Features" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-6", children: "Enable or disable features for your restaurant" }), (0, jsx_runtime_1.jsx)("div", { className: "bg-blue-50 border-l-4 border-blue-400 p-4 mb-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Info, { className: "h-5 w-5 text-blue-400" }), (0, jsx_runtime_1.jsx)("div", { className: "ml-3", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-blue-700", children: "Welcome to Features! Here you can manage all the tools and capabilities available for your restaurant. Start with Allergenie for menu and allergen management, and explore our upcoming features." }) })] }) }), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-6", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-8", children: Object.entries(groupedFeatures).map(([category, categoryFeatures]) => ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: categoryNames[category] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: categoryFeatures.map((feature) => ((0, jsx_runtime_1.jsx)("div", { className: "border border-gray-200 rounded-lg p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-lg font-medium text-gray-900", children: feature.name }), feature.status === 'coming_soon' && ((0, jsx_runtime_1.jsx)("span", { className: "ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800", children: "Coming Soon" }))] }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-gray-500", children: feature.description })] }), (0, jsx_runtime_1.jsx)("div", { className: "ml-4 flex items-center space-x-2", children: feature.status === 'coming_soon' ? ((0, jsx_runtime_1.jsxs)("button", { onClick: () => handleNotifyFeature(feature.feature_key), className: `inline-flex items-center px-3 py-1.5 border ${notifyFeatures.has(feature.feature_key)
                                                                    ? 'border-blue-500 text-blue-500'
                                                                    : 'border-gray-300 text-gray-700'} text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bell, { className: "h-4 w-4 mr-1" }), notifyFeatures.has(feature.feature_key) ? 'Notified' : 'Notify Me'] })) : ((0, jsx_runtime_1.jsxs)("label", { className: "inline-flex items-center cursor-pointer", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", className: "sr-only peer", checked: feature.is_enabled, onChange: () => handleToggleFeature(feature.id, !feature.is_enabled), disabled: isUpdating || !canEdit }), (0, jsx_runtime_1.jsx)("div", { className: "relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] })) })] }) }, feature.feature_key))) })] }, category))) }))] })] })] }));
};
exports.default = RestaurantSettings;
