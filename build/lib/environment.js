"use strict";
/**
 * Safe access to environment variables
 * This abstracts away direct import.meta.env access to avoid TypeScript errors
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
exports.DEEPSEEK_MODEL = exports.DEEPSEEK_API_KEY = exports.SUPABASE_ANON_KEY = exports.SUPABASE_URL = exports.initializeConfig = void 0;
exports.getEnvVar = getEnvVar;
// For Vite environments
let envVars = {};
// Server-provided configuration (populated by initializeConfig)
let serverConfig = {};
// Try to access import.meta.env if available (for development only)
try {
    // @ts-ignore - Ignoring TypeScript errors for import.meta
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        envVars = import.meta.env;
    }
}
catch (error) {
    console.warn('Could not access import.meta.env, using fallbacks');
}
// Helper function to safely get an environment variable with a fallback
function getEnvVar(key, fallback = '') {
    // First try server config (highest priority, fetched at runtime)
    if (serverConfig[key.replace('VITE_', '').toLowerCase()]) {
        return serverConfig[key.replace('VITE_', '').toLowerCase()];
    }
    // Then try import.meta.env for development
    if (envVars[key]) {
        return envVars[key];
    }
    // Then try process.env for Node environments
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    // Fallback value
    return fallback;
}
// Initialize configuration by fetching from server
const initializeConfig = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch('/.netlify/functions/config');
        if (!response.ok) {
            throw new Error('Failed to fetch configuration');
        }
        serverConfig = yield response.json();
        console.log('Environment configuration loaded from server');
    }
    catch (error) {
        console.error('Failed to load environment configuration:', error);
    }
});
exports.initializeConfig = initializeConfig;
// Expose environment variables
const SUPABASE_URL = () => getEnvVar('VITE_SUPABASE_URL');
exports.SUPABASE_URL = SUPABASE_URL;
const SUPABASE_ANON_KEY = () => getEnvVar('VITE_SUPABASE_ANON_KEY');
exports.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
const DEEPSEEK_API_KEY = () => getEnvVar('VITE_DEEPSEEK_API_KEY');
exports.DEEPSEEK_API_KEY = DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = () => getEnvVar('VITE_DEEPSEEK_MODEL', 'deepseek-chat');
exports.DEEPSEEK_MODEL = DEEPSEEK_MODEL;
