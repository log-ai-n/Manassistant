"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("./contexts/AuthContext");
const RestaurantContext_1 = require("./contexts/RestaurantContext");
const ProtectedRoute_1 = __importDefault(require("./components/ProtectedRoute"));
const Login_1 = __importDefault(require("./pages/auth/Login"));
const Register_1 = __importDefault(require("./pages/auth/Register"));
const Dashboard_1 = __importDefault(require("./pages/Dashboard"));
const Settings_1 = __importDefault(require("./pages/restaurant/Settings"));
const Members_1 = __importDefault(require("./pages/restaurant/Members"));
const Allergenie_1 = __importDefault(require("./pages/features/Allergenie"));
const Layout_1 = __importDefault(require("./components/Layout"));
const StaffLayout_1 = __importDefault(require("./components/StaffLayout"));
const AcceptInvitation_1 = __importDefault(require("./pages/auth/AcceptInvitation"));
const UserSettings_1 = __importDefault(require("./pages/UserSettings"));
const MemoryTester_1 = __importDefault(require("./components/MemoryTester"));
const Auth0Tester_1 = __importDefault(require("./components/Auth0Tester"));
const SpeedInsightsAdmin_1 = __importDefault(require("./components/SpeedInsightsAdmin"));
const react_1 = require("@vercel/speed-insights/react");
const LandingPage_1 = __importDefault(require("./pages/LandingPage"));
const MemoryDemonstrator_1 = __importDefault(require("./components/MemoryDemonstrator"));
function PrivateRoute({ children }) {
    const { user, loading } = (0, AuthContext_1.useAuth)();
    if (loading) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center h-screen", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }));
    }
    if (!user) {
        return (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/login" });
    }
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: children });
}
function App() {
    return ((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsx)(AuthContext_1.AuthProvider, { children: (0, jsx_runtime_1.jsxs)(RestaurantContext_1.RestaurantProvider, { children: [(0, jsx_runtime_1.jsxs)(react_router_dom_1.Routes, { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(LandingPage_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/login", element: (0, jsx_runtime_1.jsx)(Login_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/register", element: (0, jsx_runtime_1.jsx)(Register_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/invitation/:token", element: (0, jsx_runtime_1.jsx)(AcceptInvitation_1.default, {}) }), (0, jsx_runtime_1.jsxs)(react_router_dom_1.Route, { element: (0, jsx_runtime_1.jsx)(ProtectedRoute_1.default, { children: (0, jsx_runtime_1.jsx)(StaffLayout_1.default, {}) }), children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/features/allergenie", element: (0, jsx_runtime_1.jsx)(Allergenie_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/test/memories", element: (0, jsx_runtime_1.jsx)(MemoryTester_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/test/auth0", element: (0, jsx_runtime_1.jsx)(Auth0Tester_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/admin/performance", element: (0, jsx_runtime_1.jsx)(SpeedInsightsAdmin_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/demo/memory", element: (0, jsx_runtime_1.jsx)(MemoryDemonstrator_1.default, {}) })] }), (0, jsx_runtime_1.jsxs)(react_router_dom_1.Route, { element: (0, jsx_runtime_1.jsx)(ProtectedRoute_1.default, { children: (0, jsx_runtime_1.jsx)(Layout_1.default, {}) }), children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/dashboard", element: (0, jsx_runtime_1.jsx)(Dashboard_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/settings", element: (0, jsx_runtime_1.jsx)(UserSettings_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/restaurant/settings", element: (0, jsx_runtime_1.jsx)(Settings_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/restaurant/members", element: (0, jsx_runtime_1.jsx)(Members_1.default, {}) })] }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(PrivateRoute, { children: (0, jsx_runtime_1.jsx)(Layout_1.default, { children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Routes, { children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(Dashboard_1.default, {}) }) }) }) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "*", element: (0, jsx_runtime_1.jsx)(PrivateRoute, { children: (0, jsx_runtime_1.jsx)(Layout_1.default, { children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Routes, { children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(Dashboard_1.default, {}) }) }) }) }) })] }), (0, jsx_runtime_1.jsx)(react_1.SpeedInsights, {})] }) }) }));
}
exports.default = App;
