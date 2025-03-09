"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const RestaurantContext_1 = require("../../../contexts/RestaurantContext");
const lucide_react_1 = require("lucide-react");
const MenuManagement_1 = __importDefault(require("./MenuManagement"));
const AllergenLookup_1 = __importDefault(require("./AllergenLookup"));
const AddMenuItemModal_1 = __importDefault(require("./AddMenuItemModal"));
const ImportMenuModal_1 = __importDefault(require("./ImportMenuModal"));
const Allergenie = () => {
    const { features } = (0, RestaurantContext_1.useRestaurant)();
    const isEnabled = features.some(f => f.feature_key === 'allergenie' && f.is_enabled);
    const [activeTab, setActiveTab] = (0, react_1.useState)('menu');
    const [showAddModal, setShowAddModal] = (0, react_1.useState)(false);
    const [showImportModal, setShowImportModal] = (0, react_1.useState)(false);
    const [refreshTrigger, setRefreshTrigger] = (0, react_1.useState)(0);
    if (!isEnabled) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "h-5 w-5 text-yellow-400" }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-3", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-yellow-800", children: "Feature Not Enabled" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-sm text-yellow-700", children: "The Allergenie feature is currently disabled. Please enable it in Restaurant Settings to access this feature." })] })] }) }));
    }
    const handleAddSuccess = () => {
        setShowAddModal(false);
        setRefreshTrigger(prev => prev + 1);
    };
    const handleImportSuccess = () => {
        setShowImportModal(false);
        setRefreshTrigger(prev => prev + 1);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-8", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold text-gray-900", children: "Allergenie" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Menu and allergen management system" })] }), (0, jsx_runtime_1.jsx)("div", { className: "mb-6 border-b border-gray-200", children: (0, jsx_runtime_1.jsxs)("nav", { className: "-mb-px flex space-x-8", "aria-label": "Tabs", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setActiveTab('menu'), className: `${activeTab === 'menu'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`, children: "Menu Management" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setActiveTab('lookup'), className: `${activeTab === 'lookup'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`, children: "Allergen Lookup" })] }) }), activeTab === 'menu' ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(MenuManagement_1.default, { onAddClick: () => setShowAddModal(true), onImportClick: () => setShowImportModal(true), refreshTrigger: refreshTrigger }), showAddModal && ((0, jsx_runtime_1.jsx)(AddMenuItemModal_1.default, { onClose: () => setShowAddModal(false), onSuccess: handleAddSuccess })), showImportModal && ((0, jsx_runtime_1.jsx)(ImportMenuModal_1.default, { onClose: () => setShowImportModal(false), onSuccess: handleImportSuccess }))] })) : ((0, jsx_runtime_1.jsx)(AllergenLookup_1.default, {}))] }));
};
exports.default = Allergenie;
