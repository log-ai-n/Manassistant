"use strict";
/**
 * Safe access to environment variables
 * This abstracts away direct import.meta.env access to avoid TypeScript errors
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEEPSEEK_MODEL = exports.DEEPSEEK_API_KEY = exports.SUPABASE_ANON_KEY = exports.SUPABASE_URL = void 0;
exports.getEnvVar = getEnvVar;
// For Vite environments
let envVars = {};
// Try to access import.meta.env if available
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
    // First try import.meta.env
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
// Expose environment variables
exports.SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
exports.SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');
exports.DEEPSEEK_API_KEY = getEnvVar('VITE_DEEPSEEK_API_KEY');
exports.DEEPSEEK_MODEL = getEnvVar('VITE_DEEPSEEK_MODEL', 'deepseek-chat');
