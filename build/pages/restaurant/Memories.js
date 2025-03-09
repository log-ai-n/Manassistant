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
const RestaurantContext_1 = require("../../contexts/RestaurantContext");
const memoryService_1 = require("../../services/memoryService");
const Memories = () => {
    const { currentRestaurant } = (0, RestaurantContext_1.useRestaurant)();
    const [memories, setMemories] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    // Form state
    const [newMemory, setNewMemory] = (0, react_1.useState)({
        memory_content: '',
        context: '',
        importance: 1
    });
    // Edit state
    const [editMode, setEditMode] = (0, react_1.useState)(false);
    const [currentMemory, setCurrentMemory] = (0, react_1.useState)(null);
    // Search state
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [searchContext, setSearchContext] = (0, react_1.useState)('');
    // Load memories on component mount and when restaurant changes
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
            const searchParams = {
                restaurant_id: currentRestaurant.id,
            };
            if (searchQuery) {
                searchParams.query = searchQuery;
            }
            if (searchContext) {
                searchParams.context = searchContext;
            }
            const data = yield (0, memoryService_1.getMemories)(searchParams);
            setMemories(data);
        }
        catch (err) {
            setError('Failed to load memories');
            console.error('Error loading memories:', err);
        }
        finally {
            setLoading(false);
        }
    });
    const handleSearch = (e) => {
        e.preventDefault();
        loadMemories();
    };
    const handleCreateMemory = (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        if (!(currentRestaurant === null || currentRestaurant === void 0 ? void 0 : currentRestaurant.id) || !newMemory.memory_content.trim()) {
            setError('Memory content is required');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = yield (0, memoryService_1.createMemory)({
                restaurant_id: currentRestaurant.id,
                memory_content: newMemory.memory_content,
                context: newMemory.context || undefined,
                importance: newMemory.importance
            });
            if (result) {
                setMemories([result, ...memories]);
                setNewMemory({
                    memory_content: '',
                    context: '',
                    importance: 1
                });
            }
            else {
                setError('Failed to create memory');
            }
        }
        catch (err) {
            setError('Failed to create memory');
            console.error('Error creating memory:', err);
        }
        finally {
            setLoading(false);
        }
    });
    const handleUpdateMemory = (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        if (!(currentMemory === null || currentMemory === void 0 ? void 0 : currentMemory.id))
            return;
        setLoading(true);
        setError(null);
        try {
            const result = yield (0, memoryService_1.updateMemory)({
                id: currentMemory.id,
                memory_content: currentMemory.memory_content,
                context: currentMemory.context,
                importance: currentMemory.importance
            });
            if (result) {
                // Update the memories list with the edited memory
                setMemories(memories.map(m => m.id === result.id ? result : m));
                setEditMode(false);
                setCurrentMemory(null);
            }
            else {
                setError('Failed to update memory');
            }
        }
        catch (err) {
            setError('Failed to update memory');
            console.error('Error updating memory:', err);
        }
        finally {
            setLoading(false);
        }
    });
    const handleDeleteMemory = (id) => __awaiter(void 0, void 0, void 0, function* () {
        if (!window.confirm('Are you sure you want to delete this memory?')) {
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const success = yield (0, memoryService_1.deleteMemory)(id);
            if (success) {
                setMemories(memories.filter(m => m.id !== id));
            }
            else {
                setError('Failed to delete memory');
            }
        }
        catch (err) {
            setError('Failed to delete memory');
            console.error('Error deleting memory:', err);
        }
        finally {
            setLoading(false);
        }
    });
    const startEditMemory = (memory) => {
        setCurrentMemory(memory);
        setEditMode(true);
    };
    const cancelEdit = () => {
        setCurrentMemory(null);
        setEditMode(false);
    };
    // If no restaurant is selected
    if (!currentRestaurant) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold mb-4", children: "Restaurant Memories" }), (0, jsx_runtime_1.jsx)("p", { children: "Please select a restaurant to manage memories." })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold mb-4", children: "Restaurant Memories" }), (0, jsx_runtime_1.jsxs)("p", { className: "mb-6", children: ["Manage AI assistant memories for ", currentRestaurant.name] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-gray-50 p-4 rounded-lg mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold mb-3", children: "Search Memories" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSearch, className: "flex flex-col sm:flex-row gap-3", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Search memory content...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "flex-1 px-3 py-2 border rounded" }), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Context (optional)", value: searchContext, onChange: (e) => setSearchContext(e.target.value), className: "flex-1 px-3 py-2 border rounded" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 sm:flex-initial", disabled: loading, children: "Search" })] })] }), error && (0, jsx_runtime_1.jsx)("div", { className: "bg-red-100 text-red-700 p-3 rounded mb-4", children: error }), editMode && currentMemory ? (
            /* Edit memory form */
            (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-4 border rounded-lg shadow-sm mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold mb-3", children: "Edit Memory" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleUpdateMemory, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Memory Content" }), (0, jsx_runtime_1.jsx)("textarea", { value: currentMemory.memory_content, onChange: (e) => setCurrentMemory(Object.assign(Object.assign({}, currentMemory), { memory_content: e.target.value })), rows: 3, className: "w-full px-3 py-2 border rounded", required: true })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Context (Optional)" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: currentMemory.context || '', onChange: (e) => setCurrentMemory(Object.assign(Object.assign({}, currentMemory), { context: e.target.value })), className: "w-full px-3 py-2 border rounded" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Importance (1-10)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: "1", max: "10", value: currentMemory.importance, onChange: (e) => setCurrentMemory(Object.assign(Object.assign({}, currentMemory), { importance: parseInt(e.target.value) })), className: "w-full px-3 py-2 border rounded" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 justify-end", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: cancelEdit, className: "px-4 py-2 border rounded hover:bg-gray-50", children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", disabled: loading, children: loading ? 'Saving...' : 'Save Changes' })] })] })] })) : (
            /* Create memory form */
            (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-4 border rounded-lg shadow-sm mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold mb-3", children: "Add New Memory" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleCreateMemory, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Memory Content" }), (0, jsx_runtime_1.jsx)("textarea", { value: newMemory.memory_content, onChange: (e) => setNewMemory(Object.assign(Object.assign({}, newMemory), { memory_content: e.target.value })), placeholder: "Enter memory content...", rows: 3, className: "w-full px-3 py-2 border rounded", required: true })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Context (Optional)" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: newMemory.context, onChange: (e) => setNewMemory(Object.assign(Object.assign({}, newMemory), { context: e.target.value })), placeholder: "e.g., guest preferences, menu info", className: "w-full px-3 py-2 border rounded" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Importance (1-10)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: "1", max: "10", value: newMemory.importance, onChange: (e) => setNewMemory(Object.assign(Object.assign({}, newMemory), { importance: parseInt(e.target.value) })), className: "w-full px-3 py-2 border rounded" })] }), (0, jsx_runtime_1.jsx)("div", { className: "text-right", children: (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", disabled: loading, children: loading ? 'Creating...' : 'Create Memory' }) })] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white border rounded-lg shadow-sm", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold p-4 border-b", children: "Memories" }), loading && memories.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "p-6 text-center text-gray-500", children: "Loading memories..." })) : memories.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "p-6 text-center text-gray-500", children: "No memories found. Add your first memory above." })) : ((0, jsx_runtime_1.jsx)("ul", { className: "divide-y", children: memories.map(memory => ((0, jsx_runtime_1.jsx)("li", { className: "p-4 hover:bg-gray-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-2", children: memory.memory_content }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 text-sm text-gray-500", children: [memory.context && ((0, jsx_runtime_1.jsx)("span", { className: "bg-gray-100 px-2 py-1 rounded", children: memory.context })), (0, jsx_runtime_1.jsxs)("span", { children: ["Importance: ", memory.importance] }), (0, jsx_runtime_1.jsxs)("span", { children: ["Created: ", new Date(memory.created_at).toLocaleDateString()] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => startEditMemory(memory), className: "text-blue-600 hover:text-blue-800", children: "Edit" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDeleteMemory(memory.id), className: "text-red-600 hover:text-red-800", children: "Delete" })] })] }) }, memory.id))) }))] })] }));
};
exports.default = Memories;
