import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Singleton Supabase client for client-side use.
 * This is the standard client used throughout the application.
 */
export const supabase = createSupabaseClient(
  supabaseUrl,
  supabaseAnonKey
);

// Helper to check if Supabase is actually configured
export const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn("Supabase environment variables are missing. Please check your .env file or project settings.");
}

