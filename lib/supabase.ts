import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl = (rawUrl && rawUrl.trim().length > 0) ? rawUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = (rawKey && rawKey.trim().length > 0) ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

/**
 * Utility boolean to check if Supabase is properly configured
 */
export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  !rawUrl.includes('your-project-url') &&
  !rawUrl.includes('placeholder.supabase.co')
);

/**
 * Centered Supabase Client
 * Initialized with environment variables or safe fallbacks for secure database interaction.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
