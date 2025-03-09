"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
// Sample data structure for permissions mapping
// In a real app, this would come from your backend
const SAMPLE_PERMISSION_MAP = [
    {
        auth0Role: 'Admin',
        description: 'Full system access',
        supabaseRLS: [
            { table: 'profiles', policy: 'admin_all_access', effect: 'Allow all operations' },
            { table: 'restaurants', policy: 'admin_all_access', effect: 'Allow all operations' },
            { table: 'memories', policy: 'admin_all_access', effect: 'Allow all operations' }
        ]
    },
    {
        auth0Role: 'Restaurant Owner',
        description: 'Can manage their own restaurant',
        supabaseRLS: [
            { table: 'profiles', policy: 'owner_read_access', effect: 'Read-only for restaurant staff' },
            { table: 'restaurants', policy: 'owner_manage_own', effect: 'Full access to owned restaurant' },
            { table: 'memories', policy: 'owner_manage_own', effect: 'Full access to restaurant memories' }
        ]
    },
    {
        auth0Role: 'Restaurant Staff',
        description: 'Access to restaurant features',
        supabaseRLS: [
            { table: 'profiles', policy: 'staff_read_self', effect: 'Read-only for own profile' },
            { table: 'restaurants', policy: 'staff_read_assigned', effect: 'Read-only for assigned restaurant' },
            { table: 'memories', policy: 'staff_contribute', effect: 'Can add and read memories' }
        ]
    },
    {
        auth0Role: 'Customer',
        description: 'Regular user privileges',
        supabaseRLS: [
            { table: 'profiles', policy: 'user_manage_own', effect: 'Manage own profile only' },
            { table: 'restaurants', policy: 'user_read_all', effect: 'Read-only for all restaurants' },
            { table: 'memories', policy: 'no_access', effect: 'No access to memories' }
        ]
    }
];
/**
 * Component for visualizing Auth0-Supabase permission mappings
 */
const Auth0PermissionMapping = () => {
    const [selectedRole, setSelectedRole] = (0, react_1.useState)(null);
    const permissionMap = SAMPLE_PERMISSION_MAP;
    const filteredMap = selectedRole
        ? permissionMap.filter(item => item.auth0Role === selectedRole)
        : permissionMap;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium mb-4", children: "Auth0 to Supabase Permission Mapping" }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-6", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mb-4", children: "This visualization shows how Auth0 roles map to Supabase Row Level Security policies, making security configuration transparent and easier to manage." }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-2 mt-2", children: [(0, jsx_runtime_1.jsx)("button", { className: `px-3 py-1 text-sm rounded border ${selectedRole === null ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-300'}`, onClick: () => setSelectedRole(null), children: "All Roles" }), permissionMap.map(item => ((0, jsx_runtime_1.jsx)("button", { className: `px-3 py-1 text-sm rounded border ${selectedRole === item.auth0Role ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-300'}`, onClick: () => setSelectedRole(item.auth0Role), children: item.auth0Role }, item.auth0Role)))] })] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-6", children: filteredMap.map(role => ((0, jsx_runtime_1.jsxs)("div", { className: "border rounded-lg overflow-hidden", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-blue-50 p-4 border-b", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium text-blue-900", children: role.auth0Role }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-blue-700", children: role.description })] }), (0, jsx_runtime_1.jsxs)("div", { className: "px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs", children: [role.supabaseRLS.length, " policies"] })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "divide-y", children: role.supabaseRLS.map((policy, idx) => ((0, jsx_runtime_1.jsx)("div", { className: "p-4 hover:bg-gray-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm font-medium", children: policy.table }), (0, jsx_runtime_1.jsx)("span", { className: "mx-2 text-gray-400", children: "\u2192" }), (0, jsx_runtime_1.jsx)("code", { className: "text-xs bg-gray-100 px-2 py-1 rounded", children: policy.policy })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 mt-1", children: policy.effect })] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("span", { className: "text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full", children: "Active" }) })] }) }, idx))) })] }, role.auth0Role))) }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-8 border-t pt-6", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium mb-2", children: "Visual Representation" }), (0, jsx_runtime_1.jsx)("div", { className: "h-64 border rounded-lg p-4 bg-gray-50 flex items-center justify-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-500", children: "This section would contain a visual flow diagram showing the relationship between Auth0 roles and Supabase policies" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-sm text-blue-600", children: "(Would be implemented with a visualization library in production)" })] }) })] })] }));
};
exports.default = Auth0PermissionMapping;
