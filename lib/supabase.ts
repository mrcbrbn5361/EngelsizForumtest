import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Centered Supabase Client
 * Initialized with environment variables for secure database interaction.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Utility boolean to check if Supabase is properly configured
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project-url'));
