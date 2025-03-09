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
const memory_processor_1 = require("../lib/agent-system/memory-processor");
const deepseek_client_1 = require("../lib/deepseek-client");
const environment_1 = require("../lib/environment");
const MemoryDemonstrator = () => {
    const { currentRestaurant } = (0, RestaurantContext_1.useRestaurant)();
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [inputMessage, setInputMessage] = (0, react_1.useState)('');
    const [memories, setMemories] = (0, react_1.useState)([]);
    const [relevantMemories, setRelevantMemories] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [processingMemory, setProcessingMemory] = (0, react_1.useState)(false);
    const [conversationHistory, setConversationHistory] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        if (!(currentRestaurant === null || currentRestaurant === void 0 ? void 0 : currentRestaurant.id))
            return;
        const loadMemories = () => __awaiter(void 0, void 0, void 0, function* () {
            const recentMemories = yield (0, memoryService_1.getRecentMemories)(currentRestaurant.id, 5);
            setMemories(recentMemories);
        });
        loadMemories();
    }, [currentRestaurant]);
    const generateAssistantResponse = (userMessage) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Build conversation history for context
            const chatHistory = [
                {
                    role: 'system',
                    content: `You are an AI assistant for ${(currentRestaurant === null || currentRestaurant === void 0 ? void 0 : currentRestaurant.name) || 'our restaurant'}. 
          Be friendly, helpful, and conversational. Provide specific information when asked about menu items, 
          hours, or services. Keep responses brief and focused on helping the customer.`
                },
                // Add last 5 messages from history for context
                ...conversationHistory.slice(-5)
            ];
            // Generate base response from DeepSeek
            const baseResponse = yield (0, deepseek_client_1.generateChatCompletion)({
                messages: [...chatHistory, { role: 'user', content: userMessage }]
            });
            // If we have relevant memories, enhance the response
            if (relevantMemories.length > 0) {
                return yield (0, deepseek_client_1.enhanceResponseWithMemories)(baseResponse, relevantMemories);
            }
            return baseResponse;
        }
        catch (error) {
            console.error('Error generating AI response:', error);
            // Fallback responses if API fails
            if (userMessage.toLowerCase().includes('allergy') || userMessage.toLowerCase().includes('allergic')) {
                return `I've noted your allergy information. We'll make sure the kitchen is informed about this whenever you visit.`;
            }
            if (userMessage.toLowerCase().includes('birthday') || userMessage.toLowerCase().includes('anniversary')) {
                return `Thank you for sharing about your special day! We'll make sure to help you celebrate when the time comes.`;
            }
            return `Thanks for your message. I'm having some trouble connecting right now, but I'll be sure to help you when I'm back online.`;
        }
    });
    const handleSubmitMessage = (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        if (!inputMessage.trim() || !(currentRestaurant === null || currentRestaurant === void 0 ? void 0 : currentRestaurant.id))
            return;
        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            content: inputMessage,
            role: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        // Update conversation history
        setConversationHistory(prev => [...prev, { role: 'user', content: inputMessage }]);
        setInputMessage('');
        setLoading(true);
        // Process for getting relevant memories
        const memories = yield (0, memory_processor_1.getRelevantMemories)(currentRestaurant.id, inputMessage, 'conversation');
        setRelevantMemories(memories);
        // Generate response
        const response = yield generateAssistantResponse(inputMessage);
        // Add assistant message
        const assistantMessage = {
            id: (Date.now() + 1).toString(),
            content: response,
            role: 'assistant',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        // Update conversation history with assistant response
        setConversationHistory(prev => [...prev, { role: 'assistant', content: response }]);
        setLoading(false);
        // Process for new memories (in background)
        setProcessingMemory(true);
        (0, memory_processor_1.processConversationForMemories)({
            restaurantId: currentRestaurant.id,
            userMessage: inputMessage
        }).then(() => __awaiter(void 0, void 0, void 0, function* () {
            // Refresh memories list
            const recentMemories = yield (0, memoryService_1.getRecentMemories)(currentRestaurant.id, 5);
            setMemories(recentMemories);
            setProcessingMemory(false);
        }));
    });
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6 mx-auto max-w-4xl", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold mb-4", children: "AI Memory System Demo" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mb-6", children: "This demonstrates how the AI remembers important details from conversations using DeepSeek. Try mentioning allergies, preferences, or special occasions in your messages." }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "md:col-span-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4", children: messages.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-center text-gray-400 mt-32", children: "Start a conversation to see AI memories in action" })) : ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [messages.map(message => ((0, jsx_runtime_1.jsxs)("div", { className: `p-3 rounded-lg max-w-[80%] ${message.role === 'user'
                                                ? 'bg-blue-100 ml-auto'
                                                : 'bg-gray-200'}`, children: [(0, jsx_runtime_1.jsx)("p", { children: message.content }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 mt-1", children: message.timestamp.toLocaleTimeString() })] }, message.id))), loading && ((0, jsx_runtime_1.jsxs)("div", { className: "p-3 rounded-lg bg-gray-200 max-w-[80%] animate-pulse", children: [(0, jsx_runtime_1.jsx)("div", { className: "h-4 bg-gray-300 rounded w-3/4 mb-2" }), (0, jsx_runtime_1.jsx)("div", { className: "h-4 bg-gray-300 rounded w-1/2" })] }))] })) }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmitMessage, className: "flex", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: inputMessage, onChange: (e) => setInputMessage(e.target.value), className: "flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Type a message (try mentioning preferences or allergies)", disabled: loading }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: loading || !inputMessage.trim(), className: "px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 disabled:opacity-50", children: "Send" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "border rounded-lg p-4", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "font-medium mb-2 flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Restaurant Memories" }), processingMemory && ((0, jsx_runtime_1.jsx)("span", { className: "inline-block h-4 w-4 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin" }))] }), memories.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500", children: "No memories stored yet." })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: memories.map(memory => ((0, jsx_runtime_1.jsxs)("div", { className: "border-b pb-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm", children: memory.memory_content }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between mt-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-xs text-gray-500", children: new Date(memory.created_at).toLocaleDateString() }), (0, jsx_runtime_1.jsxs)("span", { className: "text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full", children: ["Importance: ", memory.importance] })] })] }, memory.id))) }))] }), relevantMemories.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "border rounded-lg p-4 mt-4 bg-yellow-50", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-medium mb-2", children: "Memories Used in Response" }), (0, jsx_runtime_1.jsx)("ul", { className: "list-disc list-inside space-y-1", children: relevantMemories.map((memory, idx) => ((0, jsx_runtime_1.jsx)("li", { className: "text-sm", children: memory }, idx))) })] })), (0, jsx_runtime_1.jsxs)("div", { className: "border rounded-lg p-4 mt-4 bg-blue-50", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-medium mb-2", children: "DeepSeek Status" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-700", children: ["Using model: ", (0, environment_1.DEEPSEEK_MODEL)()] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-700", children: ["API Status: ", (0, environment_1.DEEPSEEK_API_KEY)() ? 'Connected' : 'Not Connected'] })] })] })] })] }));
};
exports.default = MemoryDemonstrator;
