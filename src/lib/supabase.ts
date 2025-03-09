import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Initial configuration with placeholder values
let supabaseUrl = '';
let supabaseAnonKey = '';

// Create supabase client with initial empty values (will be updated later)
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Initialize configuration by fetching from server
// This should be called during app initialization
export const initializeSupabase = async (): Promise<void> => {
  try {
    // Always fetch configuration from the serverless function, regardless of environment
    // This prevents leaking secrets to the client bundle
    
    // For Node.js environment in development, use environment variables directly
    if (process.env.NODE_ENV !== 'production') {
      supabaseUrl = process.env.SERVER_SUPABASE_URL || 'https://api.manassistant.com';
      supabaseAnonKey = process.env.SERVER_SUPABASE_ANON_KEY || '';
      
      // Update the supabase client with environment values
      Object.assign(supabase, createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      }));
      
      console.log('Supabase client initialized with environment variables');
      return;
    }
    
    // In browser/production environment, fetch from the serverless function
    try {
      const response = await fetch('/.netlify/functions/config');
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }
      
      const config = await response.json();
      supabaseUrl = config.supabaseUrl;
      supabaseAnonKey = config.supabaseAnonKey;
      
      // Update the supabase client with real values
      Object.assign(supabase, createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      }));
      
      console.log('Supabase client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      // Continue with placeholder values, which will cause auth to fail
      // This is better than exposing real credentials in the client bundle
    }
  } catch (error) {
    console.error('Error initializing Supabase:', error);
  }
};

// Utility function to handle Supabase errors
export const handleSupabaseError = (error: Error) => {
  console.error('Supabase error:', error.message);
  // You can add more error handling logic here
  throw error;
};

// Add error handling for fetch failures
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  try {
    const response = await originalFetch(...args);
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

/**
 * Fetches user data from Auth0 via Supabase's Auth0 wrapper
 * This allows us to test our Auth0 integration locally
 * @param options Query options for filtering and pagination
 */
export const fetchAuth0Users = async (options?: {
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}) => {
  try {
    let query = supabase
      .from('auth0.auth0_table')
      .select('*');
    
    // Apply search if provided
    if (options?.searchTerm) {
      query = query.or(`email.ilike.%${options.searchTerm}%,name.ilike.%${options.searchTerm}%`);
    }
    
    // Apply sorting if provided
    if (options?.sortBy) {
      query = query.order(options.sortBy, { 
        ascending: options.sortDirection !== 'desc' 
      });
    } else {
      // Default sorting by created_at
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    } else {
      query = query.limit(20); // Default limit
    }
    
    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 20) - 1));
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    return { data, error: null, count };
  } catch (error) {
    console.error('Error fetching Auth0 users:', error);
    return { data: null, error, count: 0 };
  }
};