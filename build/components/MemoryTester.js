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
const RestaurantContext_1 = require("../contexts/RestaurantContext");
const memoryService_1 = require("../services/memoryService");
/**
 * A component for testing the memory service functionality
 * This is for development/testing purposes only
 */
const MemoryTester = () => {
    const { currentRestaurant } = (0, RestaurantContext_1.useRestaurant)();
    const [memories, setMemories] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [newMemory, setNewMemory] = (0, react_1.useState)('');
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [context, setContext] = (0, react_1.useState)('');
    const [importance, setImportance] = (0, react_1.useState)(1);
    const [editingMemory, setEditingMemory] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (currentRestaurant === null || currentRestaurant === void 0 ? void 0 : currentRestaurant.id) {
            loadMemories();
        }
    }, [currentRestaurant]);
    const loadMemories = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!(currentRestaurant === null || currentRestaurant === void 0 ? void 0 : currentRestaurant.id))
            return;
        setLoading(true);
        setError(null);
        try {
            const recentMemories = yield (0, memoryService_1.getRecentMemories)(currentRestaurant.id);
            setMemories(recentMemories);
        }
        catch (err) {
            console.error('Error loading memories:', err);
            setError('Failed to load memories');
        }
        finally {
            setLoading(false);
        }
    });
    const handleSearch = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!(currentRestaurant === null || currentRestaurant === void 0 ? void 0 : currentRestaurant.id))
            return;
        setLoading(true);
        setError(null);
        try {
            const searchedMemories = yield (0, memoryService_1.getMemories)({
                restaurant_id: currentRestaurant.id,
                query: searchQuery || undefined,
                context: context || undefined,
                limit: 10
            });
            setMemories(searchedMemories);
        }
        catch (err) {
            console.error('Error searching memories:', err);
            setError('Failed to search memories');
        }
        finally {
            setLoading(false);
        }
    });
    const handleAddMemory = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!newMemory.trim() || !(currentRestaurant === null || currentRestaurant === void 0 ? void 0 : currentRestaurant.id))
            return;
        setError(null);
        try {
            const memory = yield (0, memoryService_1.createMemory)({
                restaurant_id: currentRestaurant.id,
                memory_content: newMemory,
                context: context || undefined,
                importance: importance,
                user_id: undefined // Will use the current authenticated user
            });
            if (memory) {
                setMemories([memory, ...memories]);
                setNewMemory('');
                setContext('');
                setImportance(1);
            }
        }
        catch (err) {
            console.error('Error creating memory:', err);
            setError('Failed to create memory');
        }
    });
    const handleUpdateMemory = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!editingMemory)
            return;
        setError(null);
        try {
            const updated = yield (0, memoryService_1.updateMemory)({
                id: editingMemory.id,
                memory_content: editingMemory.memory_content,
                context: editingMemory.context || undefined,
                importance: editingMemory.importance
            });
            if (updated) {
                setMemories(memories.map(m => m.id === updated.id ? updated : m));
                setEditingMemory(null);
            }
        }
        catch (err) {
            console.error('Error updating memory:', err);
            setError('Failed to update memory');
        }
    });
    const handleDeleteMemory = (id) => __awaiter(void 0, void 0, void 0, function* () {
        setError(null);
        try {
            const success = yield (0, memoryService_1.deleteMemory)(id);
            if (success) {
                setMemories(memories.filter(m => m.id !== id));
            }
        }
        catch (err) {
            console.error('Error deleting memory:', err);
            setError('Failed to delete memory');
        }
    });
    if (!currentRestaurant) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "p-6 bg-yellow-50 rounded-lg", children: (0, jsx_runtime_1.jsx)("p", { className: "text-yellow-700", children: "Please select a restaurant to test memories." }) }));
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: "p-4 max-w-4xl mx-auto", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6 mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold mb-4", children: "Memory Tester" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-500 mb-4", children: ["Testing component for the restaurant memory system. Current restaurant: ", (0, jsx_runtime_1.jsx)("span", { className: "font-semibold", children: currentRestaurant.name })] }), error && ((0, jsx_runtime_1.jsx)("div", { className: "bg-red-50 text-red-700 p-3 rounded mb-4", children: error })), (0, jsx_runtime_1.jsxs)("div", { className: "mb-6 p-4 bg-gray-50 rounded-lg", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-medium mb-2", children: "Add New Memory" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Memory Content" }), (0, jsx_runtime_1.jsx)("textarea", { className: "w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500", value: newMemory, onChange: (e) => setNewMemory(e.target.value), placeholder: "Add a new restaurant memory...", rows: 3 })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Context (optional)" }), (0, jsx_runtime_1.jsx)("input", { type: "text", className: "w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500", value: context, onChange: (e) => setContext(e.target.value), placeholder: "e.g., customer-preference" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Importance (1-5)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: "1", max: "5", className: "w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500", value: importance, onChange: (e) => setImportance(parseInt(e.target.value) || 1) })] })] }), (0, jsx_runtime_1.jsx)("button", { className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", onClick: handleAddMemory, children: "Add Memory" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-6 p-4 bg-gray-50 rounded-lg", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-medium mb-2", children: "Search Memories" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Search Query" }), (0, jsx_runtime_1.jsx)("input", { type: "text", className: "w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search memory content..." })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Context Filter" }), (0, jsx_runtime_1.jsx)("input", { type: "text", className: "w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500", value: context, onChange: (e) => setContext(e.target.value), placeholder: "Filter by context..." })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-3", children: [(0, jsx_runtime_1.jsx)("button", { className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", onClick: handleSearch, children: "Search" }), (0, jsx_runtime_1.jsx)("button", { className: "px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700", onClick: loadMemories, children: "Reset" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h3", { className: "font-medium mb-4", children: ["Memories ", loading && '(Loading...)'] }), !loading && memories.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-500", children: "No memories found." })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: memories.map((memory) => ((0, jsx_runtime_1.jsx)("div", { className: "p-4 border rounded-lg", children: (editingMemory === null || editingMemory === void 0 ? void 0 : editingMemory.id) === memory.id ? ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsx)("textarea", { className: "w-full p-2 border rounded", value: editingMemory.memory_content, onChange: (e) => setEditingMemory(Object.assign(Object.assign({}, editingMemory), { memory_content: e.target.value })), rows: 3 }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Context" }), (0, jsx_runtime_1.jsx)("input", { type: "text", className: "w-full p-2 border rounded", value: editingMemory.context || '', onChange: (e) => setEditingMemory(Object.assign(Object.assign({}, editingMemory), { context: e.target.value || undefined })) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Importance" }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: "1", max: "5", className: "w-full p-2 border rounded", value: editingMemory.importance, onChange: (e) => setEditingMemory(Object.assign(Object.assign({}, editingMemory), { importance: parseInt(e.target.value) || 1 })) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-3", children: [(0, jsx_runtime_1.jsx)("button", { className: "px-3 py-1 bg-green-600 text-white rounded", onClick: handleUpdateMemory, children: "Save" }), (0, jsx_runtime_1.jsx)("button", { className: "px-3 py-1 bg-gray-600 text-white rounded", onClick: () => setEditingMemory(null), children: "Cancel" })] })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-800", children: memory.memory_content }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-3 text-sm text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["ID: ", memory.id.substring(0, 6), "..."] }), memory.context && (0, jsx_runtime_1.jsxs)("span", { children: ["Context: ", memory.context] }), (0, jsx_runtime_1.jsxs)("span", { children: ["Importance: ", memory.importance] }), (0, jsx_runtime_1.jsxs)("span", { children: ["Created: ", new Date(memory.created_at).toLocaleString()] }), memory.last_accessed && ((0, jsx_runtime_1.jsxs)("span", { children: ["Last accessed: ", new Date(memory.last_accessed).toLocaleString()] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-3 flex space-x-2", children: [(0, jsx_runtime_1.jsx)("button", { className: "px-3 py-1 text-sm bg-blue-600 text-white rounded", onClick: () => setEditingMemory(memory), children: "Edit" }), (0, jsx_runtime_1.jsx)("button", { className: "px-3 py-1 text-sm bg-red-600 text-white rounded", onClick: () => handleDeleteMemory(memory.id), children: "Delete" })] })] })) }, memory.id))) }))] })] }) }));
};
exports.default = MemoryTester;
