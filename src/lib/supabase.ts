import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

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