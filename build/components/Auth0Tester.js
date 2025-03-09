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
const supabase_1 = require("../lib/supabase");
const Auth0UserComparison_1 = __importDefault(require("./Auth0UserComparison"));
const Auth0PermissionMapping_1 = __importDefault(require("./Auth0PermissionMapping"));
/**
 * Comprehensive Auth0 dashboard for testing and managing Auth0 integration
 */
const Auth0Tester = () => {
    const [userData, setUserData] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    // Tab state
    const [activeTab, setActiveTab] = (0, react_1.useState)('users');
    // Search and filter states
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [sortBy, setSortBy] = (0, react_1.useState)('created_at');
    const [sortDirection, setSortDirection] = (0, react_1.useState)('desc');
    const [currentPage, setCurrentPage] = (0, react_1.useState)(1);
    const [itemsPerPage, setItemsPerPage] = (0, react_1.useState)(10);
    const [totalCount, setTotalCount] = (0, react_1.useState)(0);
    // Environment toggle state
    const [environment, setEnvironment] = (0, react_1.useState)('development');
    const fetchUsers = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (options = {}) {
        setLoading(true);
        try {
            const { data, error, count } = yield (0, supabase_1.fetchAuth0Users)(Object.assign({ searchTerm,
                sortBy,
                sortDirection, limit: itemsPerPage, offset: (currentPage - 1) * itemsPerPage }, options));
            if (error) {
                setError(typeof error === 'string' ? error :
                    error.message || 'Failed to fetch Auth0 users');
            }
            else if (data) {
                setUserData(data);
                if (typeof count === 'number')
                    setTotalCount(count);
            }
        }
        catch (err) {
            console.error('Error in Auth0 test component:', err);
            setError('Unexpected error fetching Auth0 users');
        }
        finally {
            setLoading(false);
        }
    });
    (0, react_1.useEffect)(() => {
        fetchUsers();
    }, [currentPage, itemsPerPage, sortBy, sortDirection, environment]);
    const handleSearch = () => {
        setCurrentPage(1); // Reset to first page on new search
        fetchUsers();
    };
    const handleSort = (column) => {
        if (sortBy === column) {
            // Toggle sort direction if clicking the same column
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        }
        else {
            // Set new sort column with default desc direction
            setSortBy(column);
            setSortDirection('desc');
        }
    };
    const handleEnvironmentChange = (env) => {
        setEnvironment(env);
        // In a real implementation, you would switch the API endpoints or connection settings here
    };
    const getSortIcon = (column) => {
        if (sortBy !== column)
            return null;
        return sortDirection === 'asc' ? '↑' : '↓';
    };
    const renderPagination = () => {
        const totalPages = Math.ceil(totalCount / itemsPerPage);
        return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mt-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "mr-2", children: "Rows per page:" }), (0, jsx_runtime_1.jsxs)("select", { className: "border rounded px-2 py-1", value: itemsPerPage, onChange: (e) => setItemsPerPage(Number(e.target.value)), children: [(0, jsx_runtime_1.jsx)("option", { value: 5, children: "5" }), (0, jsx_runtime_1.jsx)("option", { value: 10, children: "10" }), (0, jsx_runtime_1.jsx)("option", { value: 20, children: "20" }), (0, jsx_runtime_1.jsx)("option", { value: 50, children: "50" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("button", { className: "px-2 py-1 border rounded mr-1 disabled:opacity-50", disabled: currentPage === 1, onClick: () => setCurrentPage(p => Math.max(1, p - 1)), children: "Previous" }), (0, jsx_runtime_1.jsxs)("span", { className: "mx-2", children: ["Page ", currentPage, " of ", totalPages || 1] }), (0, jsx_runtime_1.jsx)("button", { className: "px-2 py-1 border rounded ml-1 disabled:opacity-50", disabled: currentPage >= totalPages, onClick: () => setCurrentPage(p => p + 1), children: "Next" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-sm text-gray-500", children: ["Showing ", userData.length, " of ", totalCount, " users"] })] }));
    };
    const renderUserDataTab = () => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6 mb-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "mb-6 p-4 bg-gray-50 rounded-lg", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-end gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Search Users" }), (0, jsx_runtime_1.jsx)("input", { type: "text", className: "w-full p-2 border rounded", placeholder: "Search by email or name...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleSearch() }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 mt-1", children: "Press Enter to search" })] }), (0, jsx_runtime_1.jsx)("button", { className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", onClick: handleSearch, children: "Search" }), (0, jsx_runtime_1.jsx)("button", { className: "px-4 py-2 border rounded hover:bg-gray-100", onClick: () => {
                                setSearchTerm('');
                                setCurrentPage(1);
                                fetchUsers({ searchTerm: '' });
                            }, children: "Clear" })] }) }), loading ? ((0, jsx_runtime_1.jsxs)("div", { className: "animate-pulse text-center p-8", children: [(0, jsx_runtime_1.jsx)("div", { className: "inline-block h-8 w-8 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2", children: "Loading Auth0 user data..." })] })) : userData.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center p-8 border rounded bg-gray-50", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-lg", children: "No Auth0 user data found" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mt-2", children: "This could mean your Auth0 wrapper is configured correctly but there are no users, or there might be an issue with permissions or configuration." })] })) : ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto rounded-lg border", children: (0, jsx_runtime_1.jsxs)("table", { className: "min-w-full divide-y divide-gray-200", children: [(0, jsx_runtime_1.jsx)("thead", { className: "bg-gray-50", children: (0, jsx_runtime_1.jsx)("tr", { children: userData[0] && Object.keys(userData[0]).map(key => ((0, jsx_runtime_1.jsxs)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100", onClick: () => handleSort(key), children: [key, " ", getSortIcon(key)] }, key))) }) }), (0, jsx_runtime_1.jsx)("tbody", { className: "bg-white divide-y divide-gray-200", children: userData.map((user, idx) => ((0, jsx_runtime_1.jsx)("tr", { className: "hover:bg-gray-50", children: Object.entries(user).map(([key, value]) => ((0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: typeof value === 'object'
                                                ? JSON.stringify(value).slice(0, 50) + (JSON.stringify(value).length > 50 ? '...' : '')
                                                : String(value) }, key))) }, idx))) })] }) }), renderPagination()] }))] }));
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-4 max-w-6xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6 mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold", children: "Auth0 Integration Dashboard" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-600", children: "Environment:" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex border rounded overflow-hidden", children: [(0, jsx_runtime_1.jsx)("button", { className: `px-3 py-1 text-sm ${environment === 'development'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100'}`, onClick: () => handleEnvironmentChange('development'), children: "Development" }), (0, jsx_runtime_1.jsx)("button", { className: `px-3 py-1 text-sm ${environment === 'production'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100'}`, onClick: () => handleEnvironmentChange('production'), children: "Production" })] })] })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mb-6", children: "This dashboard displays and manages Auth0 user data via Supabase's foreign data wrapper." }), error && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-red-50 text-red-700 p-3 rounded mb-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "font-medium", children: "Error:" }), (0, jsx_runtime_1.jsx)("p", { children: error }), (0, jsx_runtime_1.jsxs)("p", { className: "mt-2 text-sm", children: ["Make sure you've configured the Auth0 wrapper in Supabase according to the", (0, jsx_runtime_1.jsx)("a", { href: "https://supabase.com/docs/guides/database/extensions/wrappers/auth0", target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 underline ml-1", children: "documentation" }), "."] })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md overflow-hidden mb-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "border-b", children: (0, jsx_runtime_1.jsxs)("nav", { className: "flex", children: [(0, jsx_runtime_1.jsx)("button", { className: `px-4 py-2 ${activeTab === 'users'
                                        ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                                        : 'text-gray-600 hover:text-gray-800'}`, onClick: () => setActiveTab('users'), children: "User Data" }), (0, jsx_runtime_1.jsx)("button", { className: `px-4 py-2 ${activeTab === 'comparison'
                                        ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                                        : 'text-gray-600 hover:text-gray-800'}`, onClick: () => setActiveTab('comparison'), children: "Comparison View" }), (0, jsx_runtime_1.jsx)("button", { className: `px-4 py-2 ${activeTab === 'permissions'
                                        ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                                        : 'text-gray-600 hover:text-gray-800'}`, onClick: () => setActiveTab('permissions'), children: "Permission Mapping" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [activeTab === 'users' && renderUserDataTab(), activeTab === 'comparison' && (0, jsx_runtime_1.jsx)(Auth0UserComparison_1.default, { auth0Users: userData }), activeTab === 'permissions' && (0, jsx_runtime_1.jsx)(Auth0PermissionMapping_1.default, {})] })] })] }));
};
exports.default = Auth0Tester;
