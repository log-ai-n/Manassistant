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
const lucide_react_1 = require("lucide-react");
const LandingPage = () => {
    const [phoneNumber, setPhoneNumber] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const navigate = (0, react_router_dom_1.useNavigate)();
    const handleSubmit = (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        if (!phoneNumber) {
            setError('Please enter your phone number');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Here you would typically make an API call to add to waitlist
            // For now, we'll just simulate a delay
            yield new Promise(resolve => setTimeout(resolve, 1000));
            // Redirect or show success message
            alert('Thank you! You have been added to our waitlist.');
            setPhoneNumber('');
        }
        catch (err) {
            setError('Failed to join waitlist. Please try again later.');
        }
        finally {
            setLoading(false);
        }
    });
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-blue-50 flex flex-col", children: [(0, jsx_runtime_1.jsxs)("header", { className: "w-full p-4 flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-1" }), " ", (0, jsx_runtime_1.jsx)("div", { className: "flex-1 flex justify-center" }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 flex justify-end", children: (0, jsx_runtime_1.jsx)("button", { className: "inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50", onClick: () => navigate('/register'), children: "Apply for Early Access" }) })] }), (0, jsx_runtime_1.jsxs)("main", { className: "flex-1 flex flex-col items-center justify-center p-4 text-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-8 flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ChefHat, { className: "h-12 w-12 text-blue-600 mr-2" }), (0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-gray-800", children: "Manassistant" })] }), (0, jsx_runtime_1.jsx)("h2", { className: "text-4xl font-bold text-gray-800 mb-4", children: "Restaurant Training Operations" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-5xl font-bold text-blue-600 mb-8", children: "Made Simple with AI" }), (0, jsx_runtime_1.jsx)("p", { className: "text-lg text-gray-600 mb-12 max-w-2xl", children: "AI-Powered Tools to Boost Efficiency, Reduce Errors, and Streamline Training" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "w-full max-w-md mb-8", children: [error && ((0, jsx_runtime_1.jsx)("div", { className: "mb-4 p-3 bg-red-50 text-red-600 rounded-md", children: error })), (0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsx)("input", { type: "tel", value: phoneNumber, onChange: (e) => setPhoneNumber(e.target.value), placeholder: "Enter your phone number", className: "flex-1 p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: loading, className: "px-4 py-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70", children: loading ? 'Processing...' : 'Join the Waitlist' })] })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-500 mb-8", children: ["New to Manassistant? ", (0, jsx_runtime_1.jsx)("a", { href: "/register", className: "text-blue-600 hover:underline", children: "Create a restaurant account" })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "w-full max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-blue-100 h-12 w-12 flex items-center justify-center rounded-md mb-4", children: (0, jsx_runtime_1.jsx)("span", { className: "text-blue-600 text-xl", children: "\uD83C\uDF7D\uFE0F" }) }), (0, jsx_runtime_1.jsx)("h3", { className: "font-bold text-lg mb-2", children: "Allergenie" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mb-2", children: "Expected Release: March 2024" }), (0, jsx_runtime_1.jsx)("p", { className: "mb-4", children: "Ensure allergen safety for restaurants with AI" }), (0, jsx_runtime_1.jsx)("a", { href: "#learn-more", className: "text-blue-600 text-sm hover:underline", children: "Learn more about AI allergen management \u2192" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-blue-100 h-12 w-12 flex items-center justify-center rounded-md mb-4", children: (0, jsx_runtime_1.jsx)("span", { className: "text-blue-600 text-xl", children: "\u2B50" }) }), (0, jsx_runtime_1.jsx)("h3", { className: "font-bold text-lg mb-2", children: "Review Hub" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mb-2", children: "Expected Release: April 2024" }), (0, jsx_runtime_1.jsx)("p", { className: "mb-4", children: "Track server performance with AI-powered customer reviews" }), (0, jsx_runtime_1.jsx)("a", { href: "#learn-more", className: "text-blue-600 text-sm hover:underline", children: "Learn more about AI review tracking \u2192" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-blue-100 h-12 w-12 flex items-center justify-center rounded-md mb-4", children: (0, jsx_runtime_1.jsx)("span", { className: "text-blue-600 text-xl", children: "\uD83D\uDCCA" }) }), (0, jsx_runtime_1.jsx)("h3", { className: "font-bold text-lg mb-2", children: "Store LogAI" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mb-2", children: "Expected Release: May 2024" }), (0, jsx_runtime_1.jsx)("p", { className: "mb-4", children: "Streamline restaurant logs with AI insights" }), (0, jsx_runtime_1.jsx)("a", { href: "#learn-more", className: "text-blue-600 text-sm hover:underline", children: "Learn more about AI restaurant logging \u2192" })] })] }), (0, jsx_runtime_1.jsx)("footer", { className: "w-full p-4 flex justify-center mb-8", children: (0, jsx_runtime_1.jsx)("button", { className: "inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700", children: "Contact Sales" }) })] }));
};
exports.default = LandingPage;
