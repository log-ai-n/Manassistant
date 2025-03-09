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
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../../contexts/AuthContext");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("zod");
const zod_2 = require("@hookform/resolvers/zod");
const lucide_react_1 = require("lucide-react");
const memberService_1 = require("../../services/memberService");
const clsx_1 = __importDefault(require("clsx"));
const loginSchema = zod_1.z.object({
    emailOrUsername: zod_1.z.string().min(1, 'Email or username is required'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    restaurantCode: zod_1.z.string().optional(),
});
const Login = () => {
    const { signIn } = (0, AuthContext_1.useAuth)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [error, setError] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [isStaffLogin, setIsStaffLogin] = (0, react_1.useState)(false);
    const [showPassword, setShowPassword] = (0, react_1.useState)(false);
    const [restaurantCode, setRestaurantCode] = (0, react_1.useState)('');
    const { register, handleSubmit, formState: { errors, isValid }, } = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_2.zodResolver)(loginSchema),
        mode: 'onChange',
    });
    const formatRestaurantCode = (code) => {
        // Remove any existing prefix and spaces
        const cleanCode = code.replace(/^REST-/i, '').replace(/\s+/g, '');
        // Add the prefix back if there's a code
        return cleanCode ? `REST-${cleanCode}` : '';
    };
    const handleRestaurantCodeChange = (e) => {
        const rawValue = e.target.value;
        // Allow user to type without prefix, but format when leaving the input
        setRestaurantCode(rawValue);
    };
    const handleRestaurantCodeBlur = () => {
        setRestaurantCode(formatRestaurantCode(restaurantCode));
    };
    const handleStaffLogin = (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (!restaurantCode) {
            setError('Restaurant code is required for staff login');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Format the restaurant code to ensure it has the REST- prefix
            const formattedCode = formatRestaurantCode(restaurantCode);
            const { data: member, error: memberError } = yield memberService_1.memberService.verifyMemberCredentials(formattedCode, data.emailOrUsername, data.password);
            if (memberError) {
                throw memberError;
            }
            if (!member) {
                throw new Error('Invalid credentials');
            }
            // If verification successful, redirect to features page
            navigate('/features/allergenie');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to log in');
        }
        finally {
            setLoading(false);
        }
    });
    const onSubmit = (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (isStaffLogin) {
            yield handleStaffLogin(data);
            return;
        }
        try {
            setError(null);
            setLoading(true);
            const { error } = yield signIn(data.emailOrUsername, data.password);
            if (error) {
                setError(error.message);
            }
            else {
                navigate('/dashboard');
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
    return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-md w-full space-y-8", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChefHat, { className: "h-12 w-12 text-blue-600" }) }), (0, jsx_runtime_1.jsx)("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: "Sign in to Manassist Hub" }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 flex justify-center space-x-4", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setIsStaffLogin(false), className: `px-4 py-2 text-sm font-medium rounded-md ${!isStaffLogin
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300'}`, children: "Owner Login" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setIsStaffLogin(true), className: `px-4 py-2 text-sm font-medium rounded-md ${isStaffLogin
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300'}`, children: "Staff Login" })] })] }), error && ((0, jsx_runtime_1.jsx)("div", { className: "bg-red-50 border-l-4 border-red-400 p-4", children: (0, jsx_runtime_1.jsx)("div", { className: "flex", children: (0, jsx_runtime_1.jsx)("div", { className: "ml-3", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-700", children: error }) }) }) })), (0, jsx_runtime_1.jsxs)("form", { className: "mt-8 space-y-6", onSubmit: handleSubmit(onSubmit), children: [(0, jsx_runtime_1.jsxs)("div", { className: "rounded-md shadow-sm -space-y-px", children: [isStaffLogin && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "restaurantCode", className: "sr-only", children: "Restaurant Code" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsx)("span", { className: "inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Store, { className: "h-4 w-4" }) }), (0, jsx_runtime_1.jsx)("input", { id: "restaurantCode", type: "text", value: restaurantCode, onChange: handleRestaurantCodeChange, onBlur: handleRestaurantCodeBlur, className: "appearance-none rounded-none rounded-r-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm", placeholder: "Enter your restaurant code (e.g., REST-123456)" })] })] })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "emailOrUsername", className: "sr-only", children: isStaffLogin ? 'Username' : 'Email or Username' }), (0, jsx_runtime_1.jsx)("input", Object.assign({ id: "emailOrUsername", type: "text", autoComplete: isStaffLogin ? 'username' : 'email username' }, register('emailOrUsername'), { className: (0, clsx_1.default)("appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm", isStaffLogin && "rounded-none"), placeholder: isStaffLogin ? 'Username' : 'Email or Username' })), errors.emailOrUsername && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-red-600", children: errors.emailOrUsername.message }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "password", className: "sr-only", children: "Password" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative flex items-center", children: [(0, jsx_runtime_1.jsx)("input", Object.assign({ id: "password", type: showPassword ? 'text' : 'password', autoComplete: "current-password" }, register('password'), { className: "appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm pr-10", placeholder: "Password" })), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 focus:outline-none", onMouseDown: () => setShowPassword(true), onMouseUp: () => setShowPassword(false), onMouseLeave: () => setShowPassword(false), children: showPassword ? ((0, jsx_runtime_1.jsx)(lucide_react_1.EyeOff, { className: "h-5 w-5" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "h-5 w-5" })) })] }), errors.password && ((0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-red-600", children: errors.password.message }))] })] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: loading || !isValid, className: "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? 'Signing in...' : 'Sign in' }) }), !isStaffLogin && ((0, jsx_runtime_1.jsx)("div", { className: "text-center", children: (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-600", children: ["Don't have an account?", ' ', (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/register", className: "font-medium text-blue-600 hover:text-blue-500", children: "Create one" })] }) }))] })] }) }));
};
exports.default = Login;
