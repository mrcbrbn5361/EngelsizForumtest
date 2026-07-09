import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Placeholder values to prevent crashes if env vars are missing
const PLACEHOLDER_URL = 'https://placeholder-project.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-key';

/**
 * Singleton Supabase client for client-side use.
 * This is the standard client used throughout the application.
 */
export const supabase = createSupabaseClient(
  supabaseUrl || PLACEHOLDER_URL,
  supabaseAnonKey || PLACEHOLDER_KEY
);

// Helper to check if Supabase is actually configured
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseUrl !== PLACEHOLDER_URL && 
  supabaseAnonKey && 
  supabaseAnonKey !== PLACEHOLDER_KEY
);
