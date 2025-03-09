"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const lucide_react_1 = require("lucide-react");
/**
 * A reusable confirmation dialog component that provides clear feedback for high-stakes actions
 * with conversational and friendly language
 */
const ConfirmationDialog = ({ isOpen, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, type = 'warning' }) => {
    if (!isOpen)
        return null;
    // Define styles based on dialog type
    const typeStyles = {
        warning: {
            icon: (0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "h-6 w-6 text-yellow-500" }),
            iconBg: 'bg-yellow-100',
            button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
            title: 'text-yellow-800'
        },
        danger: {
            icon: (0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "h-6 w-6 text-red-500" }),
            iconBg: 'bg-red-100',
            button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
            title: 'text-red-800'
        },
        info: {
            icon: (0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "h-6 w-6 text-blue-500" }),
            iconBg: 'bg-blue-100',
            button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
            title: 'text-blue-800'
        }
    };
    const styles = typeStyles[type];
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white", role: "dialog", "aria-modal": "true", "aria-labelledby": "dialog-title", children: [(0, jsx_runtime_1.jsx)("button", { onClick: onCancel, className: "absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors", "aria-label": "Close dialog", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 20 }) }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-3 text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: `mx-auto flex items-center justify-center h-12 w-12 rounded-full ${styles.iconBg}`, children: styles.icon }), (0, jsx_runtime_1.jsx)("h3", { id: "dialog-title", className: `text-lg leading-6 font-medium ${styles.title} mt-2`, children: title }), (0, jsx_runtime_1.jsx)("div", { className: "mt-2 px-7 py-3", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600", children: message }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-center gap-4 mt-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: onCancel, className: "px-4 py-2 bg-white text-gray-700 text-base font-medium rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors", children: cancelText }), (0, jsx_runtime_1.jsxs)("button", { onClick: onConfirm, className: `px-4 py-2 text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${styles.button}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Check, { size: 16, className: "inline-block mr-1" }), confirmText] })] })] })] }) }));
};
exports.default = ConfirmationDialog;
