"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToastProvider = exports.useToast = exports.ToastContext = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const clsx_1 = __importDefault(require("clsx"));
/**
 * Toast notification component for displaying feedback messages
 */
const Toast = ({ message, description, type = 'info', duration = 5000, onClose, isVisible }) => {
    const [progress, setProgress] = (0, react_1.useState)(100);
    const [intervalId, setIntervalId] = (0, react_1.useState)(null);
    // Define toast styling based on type
    const toastStyles = {
        success: {
            icon: (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "h-5 w-5" }),
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
            borderColor: 'border-green-300',
            iconColor: 'text-green-500',
            progressColor: 'bg-green-500'
        },
        error: {
            icon: (0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "h-5 w-5" }),
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
            borderColor: 'border-red-300',
            iconColor: 'text-red-500',
            progressColor: 'bg-red-500'
        },
        warning: {
            icon: (0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "h-5 w-5" }),
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-800',
            borderColor: 'border-yellow-300',
            iconColor: 'text-yellow-500',
            progressColor: 'bg-yellow-500'
        },
        info: {
            icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Info, { className: "h-5 w-5" }),
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-800',
            borderColor: 'border-blue-300',
            iconColor: 'text-blue-500',
            progressColor: 'bg-blue-500'
        }
    };
    const style = toastStyles[type];
    // Handle automatic dismissal
    (0, react_1.useEffect)(() => {
        if (isVisible && duration !== Infinity) {
            // Set up progress bar
            const totalSteps = 100;
            const stepDuration = duration / totalSteps;
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev <= 0) {
                        clearInterval(interval);
                        onClose();
                        return 0;
                    }
                    return prev - 1;
                });
            }, stepDuration);
            setIntervalId(interval);
            // Clean up on unmount or when toast is hidden
            return () => {
                if (interval)
                    clearInterval(interval);
            };
        }
    }, [isVisible, duration, onClose]);
    // Reset progress when toast is hidden
    (0, react_1.useEffect)(() => {
        if (!isVisible) {
            setProgress(100);
            if (intervalId) {
                clearInterval(intervalId);
                setIntervalId(null);
            }
        }
    }, [isVisible, intervalId]);
    if (!isVisible)
        return null;
    return ((0, jsx_runtime_1.jsxs)("div", { className: (0, clsx_1.default)('fixed bottom-5 right-5 max-w-xs w-full shadow-md rounded-md border overflow-hidden transition-all transform', style.bgColor, style.borderColor, 'animate-slide-in'), style: { zIndex: 9999 }, role: "alert", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start", children: [(0, jsx_runtime_1.jsx)("div", { className: (0, clsx_1.default)('flex-shrink-0', style.iconColor), children: style.icon }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-3 w-0 flex-1", children: [(0, jsx_runtime_1.jsx)("p", { className: (0, clsx_1.default)('text-sm font-medium', style.textColor), children: message }), description && ((0, jsx_runtime_1.jsx)("p", { className: (0, clsx_1.default)('mt-1 text-sm opacity-90', style.textColor), children: description }))] }), (0, jsx_runtime_1.jsx)("div", { className: "ml-4 flex-shrink-0 flex", children: (0, jsx_runtime_1.jsxs)("button", { className: (0, clsx_1.default)('inline-flex rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-offset-2', style.textColor, 'hover:bg-white hover:bg-opacity-30'), onClick: onClose, children: [(0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Close" }), (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4" })] }) })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "h-1 w-full bg-gray-200 bg-opacity-50", children: (0, jsx_runtime_1.jsx)("div", { className: style.progressColor, style: { width: `${progress}%`, transition: 'width 0.1s linear' } }) })] }));
};
/**
 * Context and hook for managing toast notifications
 */
exports.ToastContext = react_1.default.createContext({
    showToast: () => { },
    hideToast: () => { },
});
const useToast = () => react_1.default.useContext(exports.ToastContext);
exports.useToast = useToast;
/**
 * Toast provider component
 */
const ToastProvider = ({ children }) => {
    const [toast, setToast] = (0, react_1.useState)(null);
    const [isVisible, setIsVisible] = (0, react_1.useState)(false);
    const showToast = (props) => {
        if (isVisible) {
            // If a toast is already visible, hide it first
            setIsVisible(false);
            setTimeout(() => {
                setToast(props);
                setIsVisible(true);
            }, 300); // Small delay for animation
        }
        else {
            setToast(props);
            setIsVisible(true);
        }
    };
    const hideToast = () => {
        setIsVisible(false);
    };
    return ((0, jsx_runtime_1.jsxs)(exports.ToastContext.Provider, { value: { showToast, hideToast }, children: [children, toast && ((0, jsx_runtime_1.jsx)(Toast, Object.assign({}, toast, { isVisible: isVisible, onClose: hideToast })))] }));
};
exports.ToastProvider = ToastProvider;
exports.default = Toast;
