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
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../../contexts/AuthContext");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("zod");
const zod_2 = require("@hookform/resolvers/zod");
const lucide_react_1 = require("lucide-react");
const registerSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name is required'),
    email: zod_1.z.string().email('Please enter a valid email address'),
    username: zod_1.z.string().min(3, 'Username must be at least 3 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: zod_1.z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});
const Register = () => {
    const { signUp } = (0, AuthContext_1.useAuth)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const location = (0, react_router_dom_1.useLocation)();
    const [error, setError] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    // Get email from query params if available (from invitation)
    const queryParams = new URLSearchParams(location.search);
    const invitationEmail = queryParams.get('email');
    const invitationToken = queryParams.get('token');
    const { register, handleSubmit, setValue, formState: { errors, isValid }, } = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_2.zodResolver)(registerSchema),
        mode: 'onChange',
        defaultValues: {
            email: invitationEmail || '',
        }
    });
    // Set email from invitation if available
    (0, react_1.useEffect)(() => {
        if (invitationEmail) {
            setValue('email', invitationEmail);
        }
    }, [invitationEmail, setValue]);
    const onSubmit = (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setError(null);
            setLoading(true);
            const { error } = yield signUp(data.email, data.username, data.password, data.fullName);
            if (error) {
                setError(error.message);
            }
            else {
                // If there's an invitation token, redirect to the invitation page
                if (invitationToken) {
                    navigate(`/invitation/${invitationToken}`);
                }
                else {
                    navigate('/dashboard');
                }
            }
        }
        catch (err) {
            setError('An unexpected error occurred');
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    });
    return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-md w-full space-y-8", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChefHat, { className: "h-12 w-12 text-blue-600" }) }), (0, jsx_runtime_1.jsx)("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: "Create your account" }), (0, jsx_runtime_1.jsxs)("p", { className: "mt-2 text-center text-sm text-gray-600", children: ["Or", ' ', (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/login", className: "font-medium text-blue-600 hover:text-blue-500", children: "sign in to your existing account" })] })] }), error && ((0, jsx_runtime_1.jsx)("div", { className: "bg-red-50 border-l-4 border-red-400 p-4", children: (0, jsx_runtime_1.jsx)("div", { className: "flex", children: (0, jsx_runtime_1.jsx)("div", { className: "ml-3", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-700", children: error }) }) }) })), (0, jsx_runtime_1.jsxs)("form", { className: "mt-8 space-y-6", onSubmit: handleSubmit(onSubmit), children: [(0, jsx_runtime_1.jsxs)("div", { className: "rounded-md shadow-sm -space-y-px", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "fullName", className: "sr-only", children: "Full Name" }), (0, jsx_runtime_1.jsx)("input", Object.assign({ id: "fullName", type: "text", autoComplete: "name" }, register('fullName'), { className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm", placeholder: "Full Name" })), errors.fullName && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-red-600", children: errors.fullName.message }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "email", className: "sr-only", children: "Email address" }), (0, jsx_runtime_1.jsx)("input", Object.assign({ id: "email", type: "email", autoComplete: "email" }, register('email'), { className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm", placeholder: "Email address", readOnly: !!invitationEmail })), errors.email && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-red-600", children: errors.email.message }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "username", className: "sr-only", children: "Username" }), (0, jsx_runtime_1.jsx)("input", Object.assign({ id: "username", type: "text", autoComplete: "username" }, register('username'), { className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm", placeholder: "Username" })), errors.username && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-red-600", children: errors.username.message }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "password", className: "sr-only", children: "Password" }), (0, jsx_runtime_1.jsx)("input", Object.assign({ id: "password", type: "password", autoComplete: "new-password" }, register('password'), { className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm", placeholder: "Password" })), errors.password && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-red-600", children: errors.password.message }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "confirmPassword", className: "sr-only", children: "Confirm Password" }), (0, jsx_runtime_1.jsx)("input", Object.assign({ id: "confirmPassword", type: "password", autoComplete: "new-password" }, register('confirmPassword'), { className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm", placeholder: "Confirm Password" })), errors.confirmPassword && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-red-600", children: errors.confirmPassword.message }))] })] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: loading || !isValid, className: "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? 'Creating account...' : 'Create account' }) })] })] }) }));
};
exports.default = Register;
