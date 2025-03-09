// Netlify serverless function to provide configuration values securely
exports.handler = async function(event, context) {
  // CORS headers to allow requests from our application
  const headers = {
    'Access-Control-Allow-Origin': '*', // Change this to your actual domain in production
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // The public config that's safe to expose to the browser
    const publicConfig = {
      // Supabase configuration using the api subdomain instead of direct Supabase URL
      supabaseUrl: 'https://api.manassistant.com',
      supabaseAnonKey: process.env.SERVER_SUPABASE_ANON_KEY || '',
      
      // DeepSeek API configuration
      deepseekApiKey: process.env.SERVER_DEEPSEEK_API_KEY || '',
      deepseekModel: process.env.SERVER_DEEPSEEK_MODEL || 'deepseek-chat',
      
      // Only provide other public configs that are needed on the client side
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(publicConfig)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to load configuration' })
    };
  }
}; 