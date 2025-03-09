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
const invitations_1 = require("../../lib/invitations");
const lucide_react_1 = require("lucide-react");
const date_fns_1 = require("date-fns");
const AcceptInvitation = () => {
    const { token } = (0, react_router_dom_1.useParams)();
    const { user, loading: authLoading } = (0, AuthContext_1.useAuth)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [status, setStatus] = (0, react_1.useState)('pending');
    const [restaurantName, setRestaurantName] = (0, react_1.useState)('');
    const [role, setRole] = (0, react_1.useState)('');
    const [email, setEmail] = (0, react_1.useState)('');
    const [expiresAt, setExpiresAt] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [success, setSuccess] = (0, react_1.useState)(null);
    const [processing, setProcessing] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const fetchInvitation = () => __awaiter(void 0, void 0, void 0, function* () {
            if (!token)
                return;
            try {
                const { invitation, status, error } = yield (0, invitations_1.getInvitationByToken)(token);
                if (error) {
                    setError('Invalid or expired invitation link');
                    setStatus('invalid');
                }
                else if (invitation) {
                    setStatus(status);
                    setRestaurantName(invitation.restaurant_name || 'Restaurant');
                    setRole(invitation.role);
                    setEmail(invitation.email);
                    setExpiresAt(invitation.expires_at);
                    // If user is logged in and invitation is for a different email
                    if (user && user.email !== invitation.email) {
                        setError(`This invitation was sent to ${invitation.email}, but you're logged in as ${user.email}`);
                    }
                }
            }
            catch (err) {
                setError('Failed to load invitation details');
                setStatus('invalid');
            }
            finally {
                setLoading(false);
            }
        });
        if (!authLoading) {
            fetchInvitation();
        }
    }, [token, authLoading, user]);
    const handleAcceptInvitation = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!token || !user)
            return;
        setProcessing(true);
        setError(null);
        try {
            const { error } = yield (0, invitations_1.acceptInvitation)(token, user.id);
            if (error) {
                setError(error.message);
            }
            else {
                setSuccess('You have successfully joined the restaurant team!');
                setStatus('accepted');
                // Redirect to dashboard after a delay
                setTimeout(() => {
                    navigate('/dashboard');
                }, 3000);
            }
        }
        catch (err) {
            setError('Failed to accept invitation');
        }
        finally {
            setProcessing(false);
        }
    });
    if (loading || authLoading) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" }) }));
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-md w-full space-y-8", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChefHat, { className: "h-12 w-12 text-blue-600" }) }), (0, jsx_runtime_1.jsx)("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: "Restaurant Invitation" })] }), error && ((0, jsx_runtime_1.jsx)("div", { className: "bg-red-50 border-l-4 border-red-400 p-4", children: (0, jsx_runtime_1.jsx)("div", { className: "flex", children: (0, jsx_runtime_1.jsx)("div", { className: "ml-3", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-700", children: error }) }) }) })), success && ((0, jsx_runtime_1.jsx)("div", { className: "bg-green-50 border-l-4 border-green-400 p-4", children: (0, jsx_runtime_1.jsx)("div", { className: "flex", children: (0, jsx_runtime_1.jsx)("div", { className: "ml-3", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-green-700", children: success }) }) }) })), (0, jsx_runtime_1.jsx)("div", { className: "bg-white p-6 rounded-lg shadow-md", children: status === 'invalid' ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { className: "mx-auto h-12 w-12 text-red-500" }), (0, jsx_runtime_1.jsx)("h3", { className: "mt-2 text-lg font-medium text-gray-900", children: "Invalid Invitation" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-gray-500", children: "This invitation link is invalid or has been removed." }), (0, jsx_runtime_1.jsx)("div", { className: "mt-6", children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/login", className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: "Go to Login" }) })] })) : status === 'expired' ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "mx-auto h-12 w-12 text-red-500" }), (0, jsx_runtime_1.jsx)("h3", { className: "mt-2 text-lg font-medium text-gray-900", children: "Invitation Expired" }), (0, jsx_runtime_1.jsxs)("p", { className: "mt-1 text-sm text-gray-500", children: ["This invitation has expired on ", (0, date_fns_1.format)(new Date(expiresAt), 'PPpp'), "."] }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-gray-500", children: "Please contact the restaurant administrator for a new invitation." }), (0, jsx_runtime_1.jsx)("div", { className: "mt-6", children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/login", className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: "Go to Login" }) })] })) : status === 'accepted' ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "mx-auto h-12 w-12 text-green-500" }), (0, jsx_runtime_1.jsx)("h3", { className: "mt-2 text-lg font-medium text-gray-900", children: "Invitation Accepted" }), (0, jsx_runtime_1.jsxs)("p", { className: "mt-1 text-sm text-gray-500", children: ["You have already joined ", restaurantName, "."] }), (0, jsx_runtime_1.jsx)("div", { className: "mt-6", children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/dashboard", className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: "Go to Dashboard" }) })] })) : ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900", children: "You've been invited!" }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500", children: "Restaurant" }), (0, jsx_runtime_1.jsx)("p", { className: "font-medium", children: restaurantName })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500", children: "Role" }), (0, jsx_runtime_1.jsx)("p", { className: "font-medium capitalize", children: role })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500", children: "Email" }), (0, jsx_runtime_1.jsx)("p", { className: "font-medium", children: email })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500", children: "Expires" }), (0, jsx_runtime_1.jsx)("p", { className: "font-medium", children: (0, date_fns_1.format)(new Date(expiresAt), 'PPpp') })] })] }), user ? ((0, jsx_runtime_1.jsxs)("div", { className: "mt-6", children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleAcceptInvitation, disabled: processing || user.email !== email, className: "w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed", children: processing ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [(0, jsx_runtime_1.jsx)("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), (0, jsx_runtime_1.jsx)("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Processing..."] })) : ('Accept Invitation') }), user.email !== email && ((0, jsx_runtime_1.jsxs)("p", { className: "mt-2 text-sm text-red-600", children: ["This invitation was sent to ", email, ", but you're logged in as ", user.email, ". Please log out and sign in with the correct email address."] })), (0, jsx_runtime_1.jsx)("div", { className: "mt-4 text-center", children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/dashboard", className: "text-sm font-medium text-blue-600 hover:text-blue-500", children: "Go to Dashboard" }) })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "mt-6 space-y-4", children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: `/register?email=${encodeURIComponent(email)}`, className: "w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: "Create Account" }), (0, jsx_runtime_1.jsx)("div", { className: "text-center", children: (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-500", children: ["Already have an account?", ' ', (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: `/login?email=${encodeURIComponent(email)}`, className: "font-medium text-blue-600 hover:text-blue-500", children: "Sign in" })] }) })] }))] })) })] }) }));
};
exports.default = AcceptInvitation;
