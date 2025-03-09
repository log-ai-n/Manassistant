/**
 * Safe access to environment variables
 * This abstracts away environment access to avoid TypeScript errors
 */

// Server-provided configuration (populated by initializeConfig)
let serverConfig: Record<string, string> = {};

// Default API domain - fallback if server config can't be loaded
const DEFAULT_API_DOMAIN = 'https://api.manassistant.com';

// Detect if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

// Helper function to safely get an environment variable with a fallback
export function getEnvVar(key: string, fallback: string = ''): string {
  // First try server config (highest priority, fetched at runtime)
  const configKey = key.replace(/^(SERVER_|VITE_)/, '').toLowerCase();
  if (serverConfig[configKey]) {
    return serverConfig[configKey];
  }
  
  // Special case for SUPABASE_URL if not found in server config
  if ((key === 'VITE_SUPABASE_URL' || key === 'SERVER_SUPABASE_URL') && !serverConfig['supabaseurl']) {
    return DEFAULT_API_DOMAIN;
  }
  
  // Then try process.env for Node environments
  if (process.env && process.env[key]) {
    return process.env[key] as string;
  }
  
  // Fallback value
  return fallback;
}

// Initialize configuration by fetching from server or using environment variables
export const initializeConfig = async (): Promise<void> => {
  try {
    // In development mode, we can use local .env values directly
    if (isDevelopment) {
      console.log('Running in development mode, using local environment variables');
      
      // Set defaults from environment variables
      serverConfig = {
        supabaseurl: process.env.SERVER_SUPABASE_URL || DEFAULT_API_DOMAIN,
        supabaseanonkey: process.env.SERVER_SUPABASE_ANON_KEY || '',
        deepseekapikey: process.env.SERVER_DEEPSEEK_API_KEY || '',
        deepseekmodel: process.env.SERVER_DEEPSEEK_MODEL || 'deepseek-chat'
      };
      
      return;
    }

    // In production, always fetch from the serverless function
    try {
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
  } catch (error) {
    console.error('Error initializing configuration:', error);
  }
};

// Expose environment variables
export const SUPABASE_URL = () => getEnvVar('SERVER_SUPABASE_URL');
export const SUPABASE_ANON_KEY = () => getEnvVar('SERVER_SUPABASE_ANON_KEY');
export const DEEPSEEK_API_KEY = () => getEnvVar('SERVER_DEEPSEEK_API_KEY');
export const DEEPSEEK_MODEL = () => getEnvVar('SERVER_DEEPSEEK_MODEL', 'deepseek-chat'); 