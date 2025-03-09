/**
 * Verification script for the updated environment configuration
 * This script checks that our environment variables and configuration setup
 * is working correctly after the DNS and security fixes.
 */

import { initializeConfig, SUPABASE_URL, SUPABASE_ANON_KEY, DEEPSEEK_API_KEY, DEEPSEEK_MODEL } from './lib/environment';

async function main() {
  console.log('Starting environment verification...');
  
  try {
    // Initialize configuration
    await initializeConfig();
    
    // Output the configuration values (safely)
    console.log('Configuration loaded successfully');
    console.log('Supabase URL:', SUPABASE_URL() || '[not set]');
    console.log('Supabase Key:', SUPABASE_ANON_KEY() ? '[key is set]' : '[key is not set]');
    console.log('DeepSeek API:', DEEPSEEK_API_KEY() ? '[key is set]' : '[key is not set]');
    console.log('DeepSeek Model:', DEEPSEEK_MODEL());
    
    // Verify that we're using the proper domain
    const supabaseUrl = SUPABASE_URL();
    if (supabaseUrl && supabaseUrl.includes('api.manassistant.com')) {
      console.log('SUCCESS: Properly using the api.manassistant.com domain for Supabase!');
    } else {
      console.log('WARNING: Not using the api.manassistant.com domain for Supabase. Current URL:', supabaseUrl);
    }
    
  } catch (error) {
    console.error('Error during verification:', error);
  }
}

// Run the verification
main().catch(console.error); 