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
const RestaurantContext_1 = require("../../contexts/RestaurantContext");
const AuthContext_1 = require("../../contexts/AuthContext");
const memberService_1 = require("../../services/memberService");
const lucide_react_1 = require("lucide-react");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("zod");
const zod_2 = require("@hookform/resolvers/zod");
const react_copy_to_clipboard_1 = require("react-copy-to-clipboard");
const clsx_1 = __importDefault(require("clsx"));
const react_router_dom_1 = require("react-router-dom");
const addMemberSchema = zod_1.z.object({
    username: zod_1.z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be less than 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    fullName: zod_1.z.string().min(2, 'Full name is required'),
    role: zod_1.z.enum(['staff', 'chef', 'manager']),
});
const ROLE_BADGES = {
    owner: 'bg-purple-100 text-purple-800',
    manager: 'bg-blue-100 text-blue-800',
    chef: 'bg-yellow-100 text-yellow-800',
    staff: 'bg-green-100 text-green-800'
};
// Helper function to capitalize names properly
const capitalizeFullName = (name) => {
    return name
        .split(' ')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
};
const RestaurantMembers = () => {
    const { currentRestaurant, userRole } = (0, RestaurantContext_1.useRestaurant)();
    const { user } = (0, AuthContext_1.useAuth)();
    const [members, setMembers] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [showAddForm, setShowAddForm] = (0, react_1.useState)(false);
    const [isAdding, setIsAdding] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [success, setSuccess] = (0, react_1.useState)(null);
    const [isRefreshing, setIsRefreshing] = (0, react_1.useState)(false);
    const [copiedField, setCopiedField] = (0, react_1.useState)(null);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [roleFilter, setRoleFilter] = (0, react_1.useState)('all');
    const [newMemberCredentials, setNewMemberCredentials] = (0, react_1.useState)(null);
    const [memberToDelete, setMemberToDelete] = (0, react_1.useState)(null);
    const canManageMembers = userRole === 'owner' || userRole === 'manager';
    const { register, handleSubmit, reset, formState: { errors } } = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_2.zodResolver)(addMemberSchema),
        defaultValues: {
            role: 'staff'
        }
    });
    const fetchMembers = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (!currentRestaurant || !user)
            return;
        setLoading(true);
        setError(null);
        try {
            const { data, error } = yield memberService_1.memberService.getMembers(currentRestaurant.id);
            if (error)
                throw error;
            // Create owner entry from user context
            const ownerEntry = {
                id: `owner-${user.id}`,
                restaurant_id: currentRestaurant.id,
                user_id: user.id,
                role: 'owner',
                username: ((_a = user.user_metadata) === null || _a === void 0 ? void 0 : _a.username) || '',
                full_name: ((_b = user.user_metadata) === null || _b === void 0 ? void 0 : _b.full_name) || '',
                email: user.email,
                password_changed: true
            };
            // Filter out any existing owner entries from regular members
            const regularMembers = (data || []).filter(member => member.role !== 'owner');
            // Combine owner with regular members
            setMembers([ownerEntry, ...regularMembers]);
        }
        catch (err) {
            console.error('Error fetching members:', err);
            setError('Failed to load team members');
        }
        finally {
            setLoading(false);
        }
    });
    (0, react_1.useEffect)(() => {
        if (currentRestaurant && user) {
            fetchMembers();
        }
    }, [currentRestaurant, user]);
    const handleRefresh = () => __awaiter(void 0, void 0, void 0, function* () {
        setIsRefreshing(true);
        setError(null);
        try {
            yield fetchMembers();
            setSuccess('Team members refreshed successfully');
        }
        catch (err) {
            setError('Failed to refresh team members');
        }
        finally {
            setIsRefreshing(false);
        }
    });
    const handleAddMember = (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (!currentRestaurant)
            return;
        setIsAdding(true);
        setError(null);
        setSuccess(null);
        try {
            // Capitalize the full name before saving
            const capitalizedFullName = capitalizeFullName(data.fullName);
            const result = yield memberService_1.memberService.addMember(currentRestaurant.id, data.username, capitalizedFullName, data.role);
            if (result.error) {
                throw result.error;
            }
            setSuccess('Member added successfully');
            setNewMemberCredentials({
                username: data.username,
                temporaryPassword: result.data.temporary_password
            });
            reset();
            yield fetchMembers();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add member');
        }
        finally {
            setIsAdding(false);
        }
    });
    const handleDeleteClick = (member) => {
        setMemberToDelete({
            id: member.id,
            name: member.full_name,
            role: member.role
        });
    };
    const handleConfirmDelete = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!memberToDelete)
            return;
        try {
            const { error } = yield memberService_1.memberService.removeMember(memberToDelete.id);
            if (error)
                throw error;
            setSuccess('Team member removed successfully');
            yield fetchMembers();
        }
        catch (err) {
            setError('Failed to remove team member');
        }
        finally {
            setMemberToDelete(null);
        }
    });
    const handleCopy = (field) => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };
    const handleCloseAddForm = () => {
        setShowAddForm(false);
        setNewMemberCredentials(null);
        fetchMembers();
    };
    const filteredMembers = members.filter(member => {
        var _a, _b;
        const matchesSearch = ((_a = member.username) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase())) ||
            ((_b = member.full_name) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === 'all' || member.role === roleFilter;
        return matchesSearch && matchesRole;
    });
    if (!currentRestaurant) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-12", children: (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500", children: "Please select a restaurant first" }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-8 flex justify-between items-center", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold text-gray-900", children: "Team Members" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Manage your restaurant staff" })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: handleRefresh, className: "inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", disabled: isRefreshing, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: (0, clsx_1.default)('mr-1 h-4 w-4', isRefreshing && 'animate-spin') }), isRefreshing ? 'Refreshing...' : 'Refresh'] })] }), (0, jsx_runtime_1.jsx)("div", { className: "bg-white shadow rounded-lg overflow-hidden", children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [error && ((0, jsx_runtime_1.jsx)("div", { className: "mb-4 bg-red-50 border-l-4 border-red-400 p-4", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-700", children: error }) })), success && ((0, jsx_runtime_1.jsx)("div", { className: "mb-4 bg-green-50 border-l-4 border-green-400 p-4", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-green-700", children: success }) })), (0, jsx_runtime_1.jsxs)("div", { className: "mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-1 max-w-sm", children: (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Search members...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsxs)("select", { value: roleFilter, onChange: (e) => setRoleFilter(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "all", children: "All Roles" }), (0, jsx_runtime_1.jsx)("option", { value: "owner", children: "Owners" }), (0, jsx_runtime_1.jsx)("option", { value: "manager", children: "Managers" }), (0, jsx_runtime_1.jsx)("option", { value: "chef", children: "Chefs" }), (0, jsx_runtime_1.jsx)("option", { value: "staff", children: "Staff" })] }), canManageMembers && ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowAddForm(true), className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.UserPlus, { className: "mr-2 h-4 w-4" }), "Add Member"] }))] })] }), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center py-6", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" }) })) : filteredMembers.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-6", children: (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500", children: "No team members found" }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "min-w-full divide-y divide-gray-200", children: [(0, jsx_runtime_1.jsx)("thead", { className: "bg-gray-50", children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Member" }), (0, jsx_runtime_1.jsx)("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Role" }), (0, jsx_runtime_1.jsx)("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Username" }), canManageMembers && ((0, jsx_runtime_1.jsx)("th", { scope: "col", className: "relative px-6 py-3", children: (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Actions" }) }))] }) }), (0, jsx_runtime_1.jsx)("tbody", { className: "bg-white divide-y divide-gray-200", children: filteredMembers.map((member) => {
                                            var _a, _b;
                                            return ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0 h-10 w-10", children: (0, jsx_runtime_1.jsx)("div", { className: "h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("span", { className: "text-gray-500 font-medium", children: ((_b = (_a = member.full_name) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || '?' }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "ml-4", children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm font-medium text-gray-900", children: member.full_name }) })] }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap", children: (0, jsx_runtime_1.jsx)("span", { className: (0, clsx_1.default)('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', ROLE_BADGES[member.role]), children: member.role }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: member.username }), canManageMembers && ((0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: member.role === 'owner' ? ((0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/settings", className: "text-gray-400 hover:text-gray-500", title: "Account Settings", children: (0, jsx_runtime_1.jsx)(lucide_react_1.UserCog, { className: "h-5 w-5" }) })) : (canManageMembers && ((0, jsx_runtime_1.jsx)("button", { onClick: () => handleDeleteClick(member), className: "text-red-600 hover:text-red-900", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "h-5 w-5" }) }))) }))] }, member.id));
                                        }) })] }) }))] }) }), memberToDelete && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg p-6 max-w-sm w-full mx-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center mb-4 text-red-600", children: (0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "h-12 w-12" }) }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900 text-center mb-2", children: "Confirm Delete" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-500 text-center mb-6", children: ["Are you sure you want to remove ", (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: memberToDelete.name }), " from the team? This action cannot be undone."] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center space-x-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setMemberToDelete(null), className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleConfirmDelete, className: "px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500", children: "Delete" })] })] }) })), showAddForm && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-medium text-gray-900 mb-4", children: "Add Team Member" }), newMemberCredentials ? ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-green-50 border-l-4 border-green-400 p-4", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-green-700", children: "Member added successfully! Share these credentials with the new team member:" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700", children: "Username" }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-1 flex rounded-md shadow-sm", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: newMemberCredentials.username, readOnly: true, className: "flex-1 block w-full rounded-l-md border-gray-300 bg-gray-50" }), (0, jsx_runtime_1.jsx)(react_copy_to_clipboard_1.CopyToClipboard, { text: newMemberCredentials.username, onCopy: () => handleCopy('username'), children: (0, jsx_runtime_1.jsx)("button", { type: "button", className: "relative inline-flex items-center px-4 py-2 -ml-px space-x-2 text-sm font-medium border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500", children: copiedField === 'username' ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Check, { className: "h-4 w-4 text-green-500" }), (0, jsx_runtime_1.jsx)("span", { className: "text-green-500", children: "Copied!" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { className: "h-4 w-4 text-gray-400" }), (0, jsx_runtime_1.jsx)("span", { children: "Copy" })] })) }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700", children: "Temporary Password" }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-1 flex rounded-md shadow-sm", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: newMemberCredentials.temporaryPassword, readOnly: true, className: "flex-1 block w-full rounded-l-md border-gray-300 bg-gray-50" }), (0, jsx_runtime_1.jsx)(react_copy_to_clipboard_1.CopyToClipboard, { text: newMemberCredentials.temporaryPassword, onCopy: () => handleCopy('password'), children: (0, jsx_runtime_1.jsx)("button", { type: "button", className: "relative inline-flex items-center px-4 py-2 -ml-px space-x-2 text-sm font-medium border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500", children: copiedField === 'password' ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Check, { className: "h-4 w-4 text-green-500" }), (0, jsx_runtime_1.jsx)("span", { className: "text-green-500", children: "Copied!" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { className: "h-4 w-4 text-gray-400" }), (0, jsx_runtime_1.jsx)("span", { children: "Copy" })] })) }) })] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "mt-6", children: (0, jsx_runtime_1.jsx)("button", { onClick: handleCloseAddForm, className: "w-full inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: "Done" }) })] })) : ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit(handleAddMember), className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "username", className: "block text-sm font-medium text-gray-700", children: "Username" }), (0, jsx_runtime_1.jsx)("input", Object.assign({ type: "text", id: "username" }, register('username'), { className: (0, clsx_1.default)("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.username ? "border-red-300" : "border-gray-300") })), errors.username && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-red-600", children: errors.username.message }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "fullName", className: "block text-sm font-medium text-gray-700", children: "Full Name" }), (0, jsx_runtime_1.jsx)("input", Object.assign({ type: "text", id: "fullName" }, register('fullName'), { className: (0, clsx_1.default)("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.fullName ? "border-red-300" : "border-gray-300") })), errors.fullName && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-red-600", children: errors.fullName.message }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "role", className: "block text-sm font-medium text-gray-700", children: "Role" }), (0, jsx_runtime_1.jsxs)("select", Object.assign({ id: "role" }, register('role'), { className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", children: [(0, jsx_runtime_1.jsx)("option", { value: "staff", children: "Staff" }), (0, jsx_runtime_1.jsx)("option", { value: "chef", children: "Chef" }), (0, jsx_runtime_1.jsx)("option", { value: "manager", children: "Manager" })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end space-x-3", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setShowAddForm(false), className: "inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: isAdding, className: "inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50", children: isAdding ? 'Adding...' : 'Add Member' })] })] }))] }) }))] }));
};
exports.default = RestaurantMembers;
