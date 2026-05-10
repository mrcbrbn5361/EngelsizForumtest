import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.warn(
      'Supabase environment variables are missing! ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
}

/**
 * Supabase client instance for client-side operations.
 * Uses placeholder values to avoid crashes if environment variables are missing.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
