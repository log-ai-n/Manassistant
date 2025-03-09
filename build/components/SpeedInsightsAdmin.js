"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_2 = require("@vercel/speed-insights/react");
const AuthContext_1 = require("../contexts/AuthContext");
// This is a private admin-only dashboard for viewing performance metrics
const SpeedInsightsAdmin = () => {
    const { user } = (0, AuthContext_1.useAuth)();
    const [vitals, setVitals] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    // Mock data - in production, you'd fetch this from Vercel API
    (0, react_1.useEffect)(() => {
        // Simulate API fetch
        setTimeout(() => {
            setVitals({
                lcp: { value: 1.8, score: 'good' },
                fid: { value: 12, score: 'good' },
                cls: { value: 0.05, score: 'good' },
                ttfb: { value: 220, score: 'good' },
                fcp: { value: 1.2, score: 'good' }
            });
            setLoading(false);
        }, 1000);
    }, []);
    // Check if user is admin or owner
    const isAdmin = (user === null || user === void 0 ? void 0 : user.role) === 'owner' || (user === null || user === void 0 ? void 0 : user.role) === 'admin';
    if (!isAdmin) {
        return (0, jsx_runtime_1.jsx)("div", { className: "p-6 text-center", children: "You don't have permission to access this page." });
    }
    const getScoreColor = (score) => {
        switch (score) {
            case 'good': return 'text-green-600';
            case 'needs-improvement': return 'text-yellow-600';
            case 'poor': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-6 max-w-4xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6 mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold mb-2", children: "Performance Dashboard" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mb-6", children: "Real-time performance metrics for your application. Full details available in the Vercel dashboard." }), loading ? ((0, jsx_runtime_1.jsxs)("div", { className: "animate-pulse text-center p-8", children: [(0, jsx_runtime_1.jsx)("div", { className: "inline-block h-8 w-8 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2", children: "Loading performance data..." })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "border rounded-lg p-4 bg-gray-50", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-gray-500", children: "Largest Contentful Paint (LCP)" }), (0, jsx_runtime_1.jsxs)("p", { className: `text-2xl font-bold ${getScoreColor(vitals.lcp.score)}`, children: [vitals.lcp.value, "s"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 mt-1", children: "Time to render largest content element" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "border rounded-lg p-4 bg-gray-50", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-gray-500", children: "First Input Delay (FID)" }), (0, jsx_runtime_1.jsxs)("p", { className: `text-2xl font-bold ${getScoreColor(vitals.fid.score)}`, children: [vitals.fid.value, "ms"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 mt-1", children: "Time before input responsiveness" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "border rounded-lg p-4 bg-gray-50", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-gray-500", children: "Cumulative Layout Shift (CLS)" }), (0, jsx_runtime_1.jsx)("p", { className: `text-2xl font-bold ${getScoreColor(vitals.cls.score)}`, children: vitals.cls.value }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 mt-1", children: "Measure of visual stability" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "border rounded-lg p-4 bg-gray-50", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-gray-500", children: "Time to First Byte (TTFB)" }), (0, jsx_runtime_1.jsxs)("p", { className: `text-2xl font-bold ${getScoreColor(vitals.ttfb.score)}`, children: [vitals.ttfb.value, "ms"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 mt-1", children: "Server response time" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "border rounded-lg p-4 bg-gray-50", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-gray-500", children: "First Contentful Paint (FCP)" }), (0, jsx_runtime_1.jsxs)("p", { className: `text-2xl font-bold ${getScoreColor(vitals.fcp.score)}`, children: [vitals.fcp.value, "s"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 mt-1", children: "Time to first content rendered" })] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "mt-8 p-4 bg-blue-50 rounded-lg", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium text-blue-800 mb-2", children: "Admin Actions" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-2", children: [(0, jsx_runtime_1.jsx)("a", { href: "https://vercel.com/dashboard", target: "_blank", rel: "noopener noreferrer", className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", children: "View Full Dashboard" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => alert('This would generate a full report in a real implementation'), className: "px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50", children: "Generate Report" })] })] })] }), (0, jsx_runtime_1.jsx)(react_2.SpeedInsights, {})] }));
};
exports.default = SpeedInsightsAdmin;
