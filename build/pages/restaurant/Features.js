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
const RestaurantContext_1 = require("../../contexts/RestaurantContext");
const supabase_1 = require("../../lib/supabase");
const lucide_react_1 = require("lucide-react");
// Feature metadata for UI display and categorization
const featureMetadata = {
    // Front of House Features
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
    // Back of House Features
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
    // Management Features
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
const RestaurantFeatures = () => {
    const { currentRestaurant, userRole } = (0, RestaurantContext_1.useRestaurant)();
    const [features, setFeatures] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [showAddForm, setShowAddForm] = (0, react_1.useState)(false);
    const [newFeatureKey, setNewFeatureKey] = (0, react_1.useState)('');
    const [isUpdating, setIsUpdating] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [success, setSuccess] = (0, react_1.useState)(null);
    const [notifyFeatures, setNotifyFeatures] = (0, react_1.useState)(new Set());
    const canManageFeatures = userRole === 'owner' || userRole === 'manager';
    (0, react_1.useEffect)(() => {
        if (currentRestaurant) {
            fetchFeatures();
        }
    }, [currentRestaurant]);
    const fetchFeatures = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!currentRestaurant)
            return;
        setLoading(true);
        try {
            const { data, error } = yield supabase_1.supabase
                .from('restaurant_features')
                .select('*')
                .eq('restaurant_id', currentRestaurant.id);
            if (error) {
                throw error;
            }
            // Enhance features with metadata
            const enhancedFeatures = data.map((feature) => {
                var _a, _b;
                return (Object.assign(Object.assign({}, feature), { display_name: ((_a = featureMetadata[feature.feature_key]) === null || _a === void 0 ? void 0 : _a.name) || feature.feature_key, description: ((_b = featureMetadata[feature.feature_key]) === null || _b === void 0 ? void 0 : _b.description) || '' }));
            });
            setFeatures(enhancedFeatures);
        }
        catch (error) {
            console.error('Error fetching features:', error);
            setError('Failed to load features. Please try again.');
        }
        finally {
            setLoading(false);
        }
    });
    const handleToggleFeature = (featureId, isEnabled) => __awaiter(void 0, void 0, void 0, function* () {
        if (!currentRestaurant || !canManageFeatures)
            return;
        setIsUpdating(true);
        setError(null);
        setSuccess(null);
        try {
            const { error } = yield supabase_1.supabase
                .from('restaurant_features')
                .update({ is_enabled: isEnabled })
                .eq('id', featureId);
            if (error) {
                throw error;
            }
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
    // Group features by category
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
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-8", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold text-gray-900", children: "Restaurant Features" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Enable or disable features for your restaurant" })] }), (0, jsx_runtime_1.jsx)("div", { className: "bg-blue-50 border-l-4 border-blue-400 p-4 mb-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Info, { className: "h-5 w-5 text-blue-400" }), (0, jsx_runtime_1.jsx)("div", { className: "ml-3", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-blue-700", children: "Welcome to Features! Here you can manage all the tools and capabilities available for your restaurant. Start with Allergenie for menu and allergen management, and explore our upcoming features." }) })] }) }), error && ((0, jsx_runtime_1.jsx)("div", { className: "mb-4 bg-red-50 border-l-4 border-red-400 p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "h-5 w-5 text-red-400" }), (0, jsx_runtime_1.jsx)("div", { className: "ml-3", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-700", children: error }) })] }) })), success && ((0, jsx_runtime_1.jsx)("div", { className: "mb-4 bg-green-50 border-l-4 border-green-400 p-4", children: (0, jsx_runtime_1.jsx)("div", { className: "flex", children: (0, jsx_runtime_1.jsx)("div", { className: "ml-3", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-green-700", children: success }) }) }) })), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-6", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-8", children: Object.entries(groupedFeatures).map(([category, categoryFeatures]) => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white shadow rounded-lg p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-medium text-gray-900 mb-4", children: categoryNames[category] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: categoryFeatures.map((feature) => ((0, jsx_runtime_1.jsx)("div", { className: "border border-gray-200 rounded-lg p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900", children: feature.name }), feature.status === 'coming_soon' && ((0, jsx_runtime_1.jsx)("span", { className: "ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800", children: "Coming Soon" }))] }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-gray-500", children: feature.description })] }), (0, jsx_runtime_1.jsx)("div", { className: "ml-4 flex items-center space-x-2", children: feature.status === 'coming_soon' ? ((0, jsx_runtime_1.jsxs)("button", { onClick: () => handleNotifyFeature(feature.feature_key), className: `inline-flex items-center px-3 py-1.5 border ${notifyFeatures.has(feature.feature_key)
                                                    ? 'border-blue-500 text-blue-500'
                                                    : 'border-gray-300 text-gray-700'} text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bell, { className: "h-4 w-4 mr-1" }), notifyFeatures.has(feature.feature_key) ? 'Notified' : 'Notify Me'] })) : ((0, jsx_runtime_1.jsxs)("label", { className: "inline-flex items-center cursor-pointer", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", className: "sr-only peer", checked: feature.is_enabled, onChange: () => handleToggleFeature(feature.id, !feature.is_enabled), disabled: isUpdating || !canManageFeatures }), (0, jsx_runtime_1.jsx)("div", { className: "relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] })) })] }) }, feature.feature_key))) })] }, category))) }))] }));
};
exports.default = RestaurantFeatures;
