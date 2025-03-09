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
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../contexts/AuthContext");
const RestaurantContext_1 = require("../contexts/RestaurantContext");
const lucide_react_1 = require("lucide-react");
const StaffLayout = () => {
    const { signOut } = (0, AuthContext_1.useAuth)();
    const { currentRestaurant, features } = (0, RestaurantContext_1.useRestaurant)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const handleSignOut = () => __awaiter(void 0, void 0, void 0, function* () {
        yield signOut();
        navigate('/login');
    });
    // Get enabled features
    const enabledFeatures = features.filter(f => f.is_enabled);
    // Feature metadata for display
    const featureMetadata = {
        allergenie: {
            name: 'Allergenie',
            description: 'Menu and allergen management system'
        },
        foh_chatbot: {
            name: 'FOH Chatbot',
            description: 'Guest service assistant'
        },
        boh_chatbot: {
            name: 'BOH Chatbot',
            description: 'Kitchen assistance'
        },
        guest_simulator: {
            name: 'Guest Simulator',
            description: 'Staff training simulator'
        },
        store_logai: {
            name: 'Store LogAI',
            description: 'Smart store logging'
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-gray-100", children: [(0, jsx_runtime_1.jsx)("nav", { className: "bg-white shadow-sm", children: (0, jsx_runtime_1.jsx)("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between h-16", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Store, { className: "h-6 w-6 text-blue-600" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-xl font-bold text-gray-900 ml-2", children: [currentRestaurant === null || currentRestaurant === void 0 ? void 0 : currentRestaurant.name, "'s Manassistant"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center", children: (0, jsx_runtime_1.jsx)("button", { onClick: handleSignOut, className: "p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none", title: "Sign Out", children: (0, jsx_runtime_1.jsx)(lucide_react_1.LogOut, { size: 20 }) }) })] }) }) }), (0, jsx_runtime_1.jsx)("main", { className: "max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8", children: window.location.pathname === '/dashboard' ? ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: enabledFeatures.map((feature) => {
                        var _a, _b;
                        return ((0, jsx_runtime_1.jsxs)("div", { onClick: () => navigate(`/features/${feature.feature_key}`), className: "bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Store, { className: "h-12 w-12 text-blue-600 mb-3" }) }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900 text-center mb-2", children: ((_a = featureMetadata[feature.feature_key]) === null || _a === void 0 ? void 0 : _a.name) || feature.feature_key }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 text-center", children: ((_b = featureMetadata[feature.feature_key]) === null || _b === void 0 ? void 0 : _b.description) || '' })] }, feature.feature_key));
                    }) })) : ((0, jsx_runtime_1.jsx)(react_router_dom_1.Outlet, {})) })] }));
};
exports.default = StaffLayout;
