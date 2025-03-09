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
exports.fetchAuth0Users = exports.handleSupabaseError = exports.initializeSupabase = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
// Initial configuration with placeholder values
let supabaseUrl = '';
let supabaseAnonKey = '';
// Create supabase client with initial empty values (will be updated later)
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key', {
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
// Initialize configuration by fetching from server
// This should be called during app initialization
const initializeSupabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Always fetch configuration from the serverless function, regardless of environment
        // This prevents leaking secrets to the client bundle
        const response = yield fetch('/.netlify/functions/config');
        if (!response.ok) {
            throw new Error('Failed to fetch configuration');
        }
        const config = yield response.json();
        supabaseUrl = config.supabaseUrl;
        supabaseAnonKey = config.supabaseAnonKey;
        // Update the supabase client with real values
        Object.assign(exports.supabase, (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey, {
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
    }
    catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        // Continue with placeholder values, which will cause auth to fail
        // This is better than exposing real credentials in the client bundle
    }
});
exports.initializeSupabase = initializeSupabase;
// Utility function to handle Supabase errors
const handleSupabaseError = (error) => {
    console.error('Supabase error:', error.message);
    // You can add more error handling logic here
    throw error;
};
exports.handleSupabaseError = handleSupabaseError;
// Add error handling for fetch failures
const originalFetch = window.fetch;
window.fetch = function (...args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield originalFetch(...args);
            return response;
        }
        catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    });
};
/**
 * Fetches user data from Auth0 via Supabase's Auth0 wrapper
 * This allows us to test our Auth0 integration locally
 * @param options Query options for filtering and pagination
 */
const fetchAuth0Users = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = exports.supabase
            .from('auth0.auth0_table')
            .select('*');
        // Apply search if provided
        if (options === null || options === void 0 ? void 0 : options.searchTerm) {
            query = query.or(`email.ilike.%${options.searchTerm}%,name.ilike.%${options.searchTerm}%`);
        }
        // Apply sorting if provided
        if (options === null || options === void 0 ? void 0 : options.sortBy) {
            query = query.order(options.sortBy, {
                ascending: options.sortDirection !== 'desc'
            });
        }
        else {
            // Default sorting by created_at
            query = query.order('created_at', { ascending: false });
        }
        // Apply pagination
        if (options === null || options === void 0 ? void 0 : options.limit) {
            query = query.limit(options.limit);
        }
        else {
            query = query.limit(20); // Default limit
        }
        if (options === null || options === void 0 ? void 0 : options.offset) {
            query = query.range(options.offset, (options.offset + (options.limit || 20) - 1));
        }
        const { data, error, count } = yield query;
        if (error)
            throw error;
        return { data, error: null, count };
    }
    catch (error) {
        console.error('Error fetching Auth0 users:', error);
        return { data: null, error, count: 0 };
    }
});
exports.fetchAuth0Users = fetchAuth0Users;
