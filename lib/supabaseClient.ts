// Supabase client configuration
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create client with fallback for build time and missing env vars
const getSupabaseClient = (): SupabaseClient => {
  // Always provide a valid client, even if env vars are missing
  // This prevents runtime errors - operations will fail gracefully
  if (!supabaseUrl || !supabaseAnonKey) {
    // Use placeholder values that won't crash the app
    // Real operations will fail, but the app won't crash
    const placeholderUrl = 'https://placeholder.supabase.co';
    const placeholderKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
    
    console.warn('⚠️ Supabase environment variables missing. Using placeholder client.');
    return createClient(placeholderUrl, placeholderKey);
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

// Create a single supabase client for interacting with your database
export const supabase = getSupabaseClient();

export default supabase;

