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
const supabase_1 = require("../lib/supabase");
/**
 * Component that compares Auth0 users with Supabase users
 * to check synchronization status
 */
const Auth0UserComparison = ({ auth0Users }) => {
    const [comparisonData, setComparisonData] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const compareUsers = () => __awaiter(void 0, void 0, void 0, function* () {
            setLoading(true);
            try {
                if (!auth0Users.length) {
                    setComparisonData([]);
                    return;
                }
                // Extract emails from Auth0 users to query Supabase
                const emails = auth0Users
                    .filter(user => user.email)
                    .map(user => user.email);
                // Query Supabase for users with matching emails
                const { data: supabaseUsers, error } = yield supabase_1.supabase
                    .from('profiles')
                    .select('*')
                    .in('email', emails);
                if (error)
                    throw error;
                // Create comparison data
                const comparison = auth0Users.map(auth0User => {
                    const matchingSupabaseUser = supabaseUsers === null || supabaseUsers === void 0 ? void 0 : supabaseUsers.find(supaUser => supaUser.email === auth0User.email);
                    return {
                        auth0User,
                        supabaseUser: matchingSupabaseUser || null,
                        status: matchingSupabaseUser
                            ? (isSynced(auth0User, matchingSupabaseUser) ? 'synced' : 'not-synced')
                            : 'missing'
                    };
                });
                setComparisonData(comparison);
            }
            catch (err) {
                console.error('Error comparing users:', err);
                setError('Failed to compare users between Auth0 and Supabase');
            }
            finally {
                setLoading(false);
            }
        });
        compareUsers();
    }, [auth0Users]);
    // Check if Auth0 user data is synced with Supabase user data
    const isSynced = (auth0User, supabaseUser) => {
        // Basic checks - you would customize this based on your data structure
        return (auth0User.email === supabaseUser.email &&
            (auth0User.name === supabaseUser.full_name ||
                (auth0User.name === null && supabaseUser.full_name === null)));
    };
    // Get sync status label and color
    const getStatusDisplay = (status) => {
        switch (status) {
            case 'synced':
                return { label: 'Synced', color: 'bg-green-100 text-green-800' };
            case 'not-synced':
                return { label: 'Out of Sync', color: 'bg-yellow-100 text-yellow-800' };
            case 'missing':
                return { label: 'Missing in Supabase', color: 'bg-red-100 text-red-800' };
            default:
                return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium mb-4", children: "User Synchronization Status" }), error && ((0, jsx_runtime_1.jsx)("div", { className: "bg-red-50 text-red-700 p-3 rounded mb-4", children: error })), loading ? ((0, jsx_runtime_1.jsxs)("div", { className: "animate-pulse text-center p-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "inline-block h-8 w-8 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2", children: "Comparing users..." })] })) : comparisonData.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "text-center p-6 border rounded bg-gray-50", children: (0, jsx_runtime_1.jsx)("p", { children: "No users to compare" }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "min-w-full divide-y divide-gray-200", children: [(0, jsx_runtime_1.jsx)("thead", { className: "bg-gray-50", children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Email" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Auth0 Name" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Supabase Name" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Action" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { className: "bg-white divide-y divide-gray-200", children: comparisonData.map((comparison, idx) => {
                                var _a;
                                const { label, color } = getStatusDisplay(comparison.status);
                                return ((0, jsx_runtime_1.jsxs)("tr", { className: "hover:bg-gray-50", children: [(0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: comparison.auth0User.email }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: comparison.auth0User.name || 'N/A' }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: ((_a = comparison.supabaseUser) === null || _a === void 0 ? void 0 : _a.full_name) || 'N/A' }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap", children: (0, jsx_runtime_1.jsx)("span", { className: `px-2 py-1 text-xs rounded-full ${color}`, children: label }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm", children: comparison.status !== 'synced' && ((0, jsx_runtime_1.jsx)("button", { className: "text-blue-600 hover:text-blue-800", onClick: () => alert('Synchronization function would go here'), children: "Sync User" })) })] }, idx));
                            }) })] }) })), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6 p-4 bg-blue-50 rounded-lg", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium text-blue-800 mb-2", children: "Sync Statistics" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-3 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-3 rounded shadow-sm", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold text-green-600", children: comparisonData.filter(d => d.status === 'synced').length }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-500", children: "Synced Users" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-3 rounded shadow-sm", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold text-yellow-600", children: comparisonData.filter(d => d.status === 'not-synced').length }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-500", children: "Out of Sync" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-3 rounded shadow-sm", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold text-red-600", children: comparisonData.filter(d => d.status === 'missing').length }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-500", children: "Missing Users" })] })] })] })] }));
};
exports.default = Auth0UserComparison;
