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
const AuthContext_1 = require("../contexts/AuthContext");
const supabase_1 = require("../lib/supabase");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("zod");
const zod_2 = require("@hookform/resolvers/zod");
const lucide_react_1 = require("lucide-react");
const memberService_1 = require("../services/memberService");
const clsx_1 = __importDefault(require("clsx"));
const profileSchema = zod_1.z.object({
    full_name: zod_1.z.string().min(2, 'Full name is required'),
    username: zod_1.z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be less than 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: zod_1.z.string().email('Please enter a valid email').optional(),
    current_password: zod_1.z.string().min(6).optional(),
    new_password: zod_1.z.string().min(6).optional(),
    confirm_password: zod_1.z.string().optional()
}).refine(data => {
    if (data.new_password && !data.current_password) {
        return false;
    }
    if (data.new_password !== data.confirm_password) {
        return false;
    }
    return true;
}, {
    message: "Passwords don't match or current password is required",
    path: ['confirm_password']
});
const UserSettings = () => {
    const { user } = (0, AuthContext_1.useAuth)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [success, setSuccess] = (0, react_1.useState)(null);
    const [originalUsername, setOriginalUsername] = (0, react_1.useState)('');
    const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_2.zodResolver)(profileSchema),
        defaultValues: {
            full_name: '',
            username: '',
            email: (user === null || user === void 0 ? void 0 : user.email) || '',
        }
    });
    const currentUsername = watch('username');
    (0, react_1.useEffect)(() => {
        const loadProfile = () => __awaiter(void 0, void 0, void 0, function* () {
            if (!user)
                return;
            try {
                const { data, error } = yield supabase_1.supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (error)
                    throw error;
                if (data) {
                    setOriginalUsername(data.username || '');
                    reset({
                        full_name: data.full_name || '',
                        username: data.username || '',
                        email: user.email || '',
                    });
                }
            }
            catch (err) {
                console.error('Error loading profile:', err);
                setError('Failed to load profile data');
            }
        });
        loadProfile();
    }, [user, reset]);
    const onSubmit = (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (!user)
            return;
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            // Check if username is unique if it was changed
            if (data.username !== originalUsername) {
                const { data: existingUser, error: checkError } = yield supabase_1.supabase
                    .from('profiles')
                    .select('id')
                    .eq('username', data.username)
                    .single();
                if (existingUser) {
                    throw new Error('Username is already taken');
                }
                if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
                    throw checkError;
                }
                // Update username in restaurant_members table
                const { error: memberError } = yield memberService_1.memberService.updateMemberUsername(user.id, data.username);
                if (memberError)
                    throw memberError;
            }
            // Update profile data
            const { error: profileError } = yield supabase_1.supabase
                .from('profiles')
                .update({
                full_name: data.full_name,
                username: data.username,
                updated_at: new Date().toISOString(),
            })
                .eq('id', user.id);
            if (profileError)
                throw profileError;
            // Update password if provided
            if (data.new_password && data.current_password) {
                const { error: passwordError } = yield supabase_1.supabase.auth.updateUser({
                    password: data.new_password
                });
                if (passwordError)
                    throw passwordError;
            }
            setSuccess('Profile updated successfully');
            setOriginalUsername(data.username);
        }
        catch (err) {
            console.error('Error updating profile:', err);
            setError(err instanceof Error ? err.message : 'Failed to update profile');
        }
        finally {
            setLoading(false);
        }
    });
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-8", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold text-gray-900", children: "User Settings" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Manage your account preferences" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white shadow rounded-lg p-6", children: [error && ((0, jsx_runtime_1.jsx)("div", { className: "mb-4 bg-red-50 border-l-4 border-red-400 p-4", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-700", children: error }) })), success && ((0, jsx_runtime_1.jsx)("div", { className: "mb-4 bg-green-50 border-l-4 border-green-400 p-4", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-green-700", children: success }) })), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "full_name", className: "block text-sm font-medium text-gray-700", children: "Full Name" }), (0, jsx_runtime_1.jsx)("input", Object.assign({ type: "text", id: "full_name" }, register('full_name'), { className: (0, clsx_1.default)("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.full_name ? "border-red-300" : "border-gray-300") })), errors.full_name && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-red-600", children: errors.full_name.message }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "username", className: "block text-sm font-medium text-gray-700", children: "Username" }), (0, jsx_runtime_1.jsx)("input", Object.assign({ type: "text", id: "username" }, register('username'), { className: (0, clsx_1.default)("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.username ? "border-red-300" : "border-gray-300") })), errors.username && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-red-600", children: errors.username.message })), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-gray-500", children: "Username can only contain letters, numbers, and underscores." })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700", children: "Email Address" }), (0, jsx_runtime_1.jsx)("input", Object.assign({ type: "email", id: "email" }, register('email'), { className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50", disabled: true }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "pt-6 border-t border-gray-200", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.KeyRound, { className: "h-5 w-5 text-gray-400" }), (0, jsx_runtime_1.jsx)("h3", { className: "ml-2 text-lg font-medium text-gray-900", children: "Change Password" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "current_password", className: "block text-sm font-medium text-gray-700", children: "Current Password" }), (0, jsx_runtime_1.jsx)("input", Object.assign({ type: "password", id: "current_password" }, register('current_password'), { className: (0, clsx_1.default)("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.current_password ? "border-red-300" : "border-gray-300") }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "new_password", className: "block text-sm font-medium text-gray-700", children: "New Password" }), (0, jsx_runtime_1.jsx)("input", Object.assign({ type: "password", id: "new_password" }, register('new_password'), { className: (0, clsx_1.default)("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.new_password ? "border-red-300" : "border-gray-300") }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "confirm_password", className: "block text-sm font-medium text-gray-700", children: "Confirm New Password" }), (0, jsx_runtime_1.jsx)("input", Object.assign({ type: "password", id: "confirm_password" }, register('confirm_password'), { className: (0, clsx_1.default)("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.confirm_password ? "border-red-300" : "border-gray-300") })), errors.confirm_password && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-red-600", children: errors.confirm_password.message }))] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex justify-end", children: (0, jsx_runtime_1.jsxs)("button", { type: "submit", disabled: loading || !isDirty, className: (0, clsx_1.default)("inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white", loading || !isDirty
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }), loading ? 'Saving...' : 'Save Changes'] }) })] })] })] }));
};
exports.default = UserSettings;
