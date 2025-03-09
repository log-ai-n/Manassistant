"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../contexts/AuthContext");
const RestaurantContext_1 = require("../contexts/RestaurantContext");
const Layout_1 = __importDefault(require("./Layout"));
const StaffLayout_1 = __importDefault(require("./StaffLayout"));
const ProtectedRoute = ({ children }) => {
    const { user, loading } = (0, AuthContext_1.useAuth)();
    const { userRole, loading: roleLoading } = (0, RestaurantContext_1.useRestaurant)();
    if (loading || roleLoading) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" }) }));
    }
    if (!user) {
        return (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/login", replace: true });
    }
    // Determine which layout to use based on user role
    if (userRole === 'owner' || userRole === 'manager') {
        return (0, jsx_runtime_1.jsx)(Layout_1.default, {});
    }
    return (0, jsx_runtime_1.jsx)(StaffLayout_1.default, {});
};
exports.default = ProtectedRoute;
