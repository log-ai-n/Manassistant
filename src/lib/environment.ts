/**
 * Safe access to environment variables
 * This abstracts away direct import.meta.env access to avoid TypeScript errors
 */

// For Vite environments
let envVars: Record<string, string> = {};

// Try to access import.meta.env if available
try {
  // @ts-ignore - Ignoring TypeScript errors for import.meta
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    envVars = import.meta.env;
  }
} catch (error) {
  console.warn('Could not access import.meta.env, using fallbacks');
}

// Helper function to safely get an environment variable with a fallback
export function getEnvVar(key: string, fallback: string = ''): string {
  // First try import.meta.env
  if (envVars[key]) {
    return envVars[key];
  }
  
  // Then try process.env for Node environments
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  
  // Fallback value
  return fallback;
}

// Expose environment variables
export const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');
export const DEEPSEEK_API_KEY = getEnvVar('VITE_DEEPSEEK_API_KEY');
export const DEEPSEEK_MODEL = getEnvVar('VITE_DEEPSEEK_MODEL', 'deepseek-chat'); 