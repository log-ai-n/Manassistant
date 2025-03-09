"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSkeleton = exports.TableSkeleton = exports.StatCardSkeleton = exports.CardSkeleton = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const clsx_1 = __importDefault(require("clsx"));
/**
 * A skeleton loader component that provides visual feedback during loading states
 */
const Skeleton = ({ className, width, height, circle = false, animate = true }) => {
    return ((0, jsx_runtime_1.jsx)("div", { className: (0, clsx_1.default)('bg-gray-200 inline-block', animate && 'animate-pulse', circle && 'rounded-full', !circle && 'rounded', className), style: {
            width: width,
            height: height,
        } }));
};
/**
 * A card-like skeleton loader for content
 */
const CardSkeleton = ({ rows = 3, hasImage = false }) => {
    return ((0, jsx_runtime_1.jsx)("div", { className: "bg-white rounded-lg p-4 shadow-sm w-full", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start space-x-4", children: [hasImage && ((0, jsx_runtime_1.jsx)(Skeleton, { width: 64, height: 64, circle: true })), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 space-y-3", children: [(0, jsx_runtime_1.jsx)(Skeleton, { width: "60%", height: 20 }), Array.from({ length: rows }).map((_, i) => ((0, jsx_runtime_1.jsx)(Skeleton, { width: i % 2 === 0 ? '100%' : '80%', height: 14 }, i)))] })] }) }));
};
exports.CardSkeleton = CardSkeleton;
/**
 * A skeleton loader for stat cards
 */
const StatCardSkeleton = ({ count = 4 }) => {
    return ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: Array.from({ length: count }).map((_, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg p-6 shadow-sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center mb-4", children: [(0, jsx_runtime_1.jsx)(Skeleton, { width: 40, height: 40, className: "mr-4" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(Skeleton, { width: 100, height: 16, className: "mb-2" }), (0, jsx_runtime_1.jsx)(Skeleton, { width: 60, height: 24 })] })] }), (0, jsx_runtime_1.jsx)(Skeleton, { width: "40%", height: 16 })] }, i))) }));
};
exports.StatCardSkeleton = StatCardSkeleton;
/**
 * A skeleton loader for tables
 */
const TableSkeleton = ({ rows = 5, columns = 4 }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-sm overflow-hidden", children: [(0, jsx_runtime_1.jsx)("div", { className: "border-b border-gray-200 bg-gray-50 p-4", children: (0, jsx_runtime_1.jsx)(Skeleton, { width: "20%", height: 20 }) }), (0, jsx_runtime_1.jsx)("div", { className: "divide-y divide-gray-200", children: Array.from({ length: rows }).map((_, rowIndex) => ((0, jsx_runtime_1.jsx)("div", { className: "p-4 flex items-center space-x-4", children: Array.from({ length: columns }).map((_, colIndex) => ((0, jsx_runtime_1.jsx)(Skeleton, { width: colIndex === 0 ? '30%' : `${Math.floor(60 / (columns - 1))}%`, height: 16 }, colIndex))) }, rowIndex))) })] }));
};
exports.TableSkeleton = TableSkeleton;
/**
 * A skeleton loader for notifications
 */
const NotificationSkeleton = ({ count = 4 }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-sm overflow-hidden", children: [(0, jsx_runtime_1.jsxs)("div", { className: "border-b border-gray-200 bg-gray-50 p-4 flex justify-between", children: [(0, jsx_runtime_1.jsx)(Skeleton, { width: 100, height: 18 }), (0, jsx_runtime_1.jsx)(Skeleton, { width: 80, height: 18 })] }), (0, jsx_runtime_1.jsx)("div", { children: Array.from({ length: count }).map((_, i) => ((0, jsx_runtime_1.jsx)("div", { className: "p-4 border-b last:border-b-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start", children: [(0, jsx_runtime_1.jsx)(Skeleton, { width: 8, height: 8, className: "mt-2 mr-2", circle: true }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)(Skeleton, { width: "80%", height: 16, className: "mb-2" }), (0, jsx_runtime_1.jsx)(Skeleton, { width: "40%", height: 12 })] })] }) }, i))) })] }));
};
exports.NotificationSkeleton = NotificationSkeleton;
exports.default = Skeleton;
