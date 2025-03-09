/**
 * Safe access to environment variables
 * This abstracts away direct import.meta.env access to avoid TypeScript errors
 */

// For Vite environments
let envVars: Record<string, string> = {};

// Server-provided configuration (populated by initializeConfig)
let serverConfig: Record<string, string> = {};

// Default API domain - fallback if server config can't be loaded
const DEFAULT_API_DOMAIN = 'https://api.manassistant.com';

// Detect if we're in development mode
const isDevelopment = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

// Try to access import.meta.env if available (for development only)
try {
  // @ts-ignore - Ignoring TypeScript errors for import.meta
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    envVars = import.meta.env;
    
    // @ts-ignore - Set development mode based on Vite's MODE
    if (import.meta.env.MODE === 'development') {
      // @ts-ignore
      (window as any).__IS_DEV__ = true;
    }
  }
} catch (error) {
  console.warn('Could not access import.meta.env, using fallbacks');
}

// Helper function to safely get an environment variable with a fallback
export function getEnvVar(key: string, fallback: string = ''): string {
  // First try server config (highest priority, fetched at runtime)
  if (serverConfig[key.replace('VITE_', '').toLowerCase()]) {
    return serverConfig[key.replace('VITE_', '').toLowerCase()];
  }
  
  // Special case for SUPABASE_URL if not found in server config
  if (key === 'VITE_SUPABASE_URL' && !serverConfig['supabaseurl']) {
    return DEFAULT_API_DOMAIN;
  }
  
  // Then try import.meta.env for development
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

// Initialize configuration by fetching from server
export const initializeConfig = async (): Promise<void> => {
  try {
    // In development mode, we can use local .env values directly
    // @ts-ignore - Check the global dev flag we might have set
    if (isDevelopment || (typeof window !== 'undefined' && (window as any).__IS_DEV__)) {
      console.log('Running in development mode, using local environment variables');
      // In development, we still try to fetch from a local function if available
      try {
        const response = await fetch('/.netlify/functions/config');
        if (response.ok) {
          serverConfig = await response.json();
          console.log('Development config loaded from local function');
        }
      } catch (error) {
        // Silently fail and use local env vars instead
      }
      return;
    }

    // In production, always fetch from the serverless function
    const response = await fetch('/.netlify/functions/config');
    if (!response.ok) {
      throw new Error('Failed to fetch configuration');
    }
    
    serverConfig = await response.json();
    console.log('Environment configuration loaded from server');
  } catch (error) {
    console.error('Failed to load environment configuration:', error);
    console.log('Using fallback API domain:', DEFAULT_API_DOMAIN);
    // Set fallback for Supabase URL
    serverConfig.supabaseurl = DEFAULT_API_DOMAIN;
  }
};

// Expose environment variables
export const SUPABASE_URL = () => getEnvVar('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = () => getEnvVar('VITE_SUPABASE_ANON_KEY');
export const DEEPSEEK_API_KEY = () => getEnvVar('VITE_DEEPSEEK_API_KEY');
export const DEEPSEEK_MODEL = () => getEnvVar('VITE_DEEPSEEK_MODEL', 'deepseek-chat'); 