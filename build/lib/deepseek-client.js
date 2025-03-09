"use strict";
/**
 * DeepSeek API client for handling AI interactions
 */
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
exports.generateChatCompletion = generateChatCompletion;
exports.extractImportantInformation = extractImportantInformation;
exports.enhanceResponseWithMemories = enhanceResponseWithMemories;
const environment_1 = require("./environment");
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
/**
 * Generates a chat completion using the DeepSeek API
 * @param options The options for the chat completion
 * @returns The generated response
 * @throws Error if the API request fails
 */
function generateChatCompletion(options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const apiKey = (0, environment_1.DEEPSEEK_API_KEY)();
            if (!apiKey) {
                throw new Error('DeepSeek API key is not configured');
            }
            const response = yield fetch(DEEPSEEK_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: options.model || (0, environment_1.DEEPSEEK_MODEL)(),
                    temperature: (_a = options.temperature) !== null && _a !== void 0 ? _a : 0.7,
                    max_tokens: (_b = options.max_tokens) !== null && _b !== void 0 ? _b : 1000,
                    messages: options.messages
                })
            });
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(`DeepSeek API error: ${((_c = errorData.error) === null || _c === void 0 ? void 0 : _c.message) || response.statusText}`);
            }
            const data = yield response.json();
            return data.choices[0].message.content;
        }
        catch (error) {
            console.error('Error generating chat completion:', error);
            throw error;
        }
    });
}
/**
 * Extracts important information from text using DeepSeek AI
 * @param text The text to analyze for important information
 * @returns Array of extracted pieces of information
 */
function extractImportantInformation(text) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const systemPrompt = `You are an AI assistant for a restaurant. Extract any important information from the customer's message that would be useful to remember for future interactions. Focus on:
1. Food preferences and dietary restrictions
2. Allergies or intolerances
3. Special occasions (birthdays, anniversaries)
4. Service preferences
5. Past experiences
Return ONLY the extracted information as a bulleted list with no additional text. If there's nothing important to extract, return an empty list.`;
            const response = yield generateChatCompletion({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: text }
                ]
            });
            // Parse the bulleted list response into an array of strings
            return response
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.startsWith('- ') || line.startsWith('* '))
                .map(line => line.substring(2).trim())
                .filter(item => item.length > 0);
        }
        catch (error) {
            console.error('Error extracting important information:', error);
            return [];
        }
    });
}
/**
 * Enhances a response with relevant memories
 * @param baseResponse The initial response to enhance
 * @param memories Array of relevant memories to incorporate
 * @returns Enhanced response that naturally includes memory context
 */
function enhanceResponseWithMemories(baseResponse, memories) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!memories.length)
            return baseResponse;
        try {
            const systemPrompt = `You are an AI assistant for a restaurant. You need to enhance your response to a customer by naturally incorporating the provided memories about the customer. Don't explicitly mention that you're using stored memories - just make your response more personalized based on what you know about them. The response should flow naturally and sound conversational.`;
            const memoryContext = `MEMORIES ABOUT THE CUSTOMER:\n${memories.map(m => `- ${m}`).join('\n')}`;
            const userPrompt = `BASE RESPONSE: ${baseResponse}\n\n${memoryContext}\n\nPlease enhance the base response by naturally incorporating the memories. Make it sound conversational and personalized without explicitly mentioning "stored memories" or "according to our records".`;
            return yield generateChatCompletion({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ]
            });
        }
        catch (error) {
            console.error('Error enhancing response with memories:', error);
            return baseResponse; // Fallback to original response if enhancement fails
        }
    });
}
