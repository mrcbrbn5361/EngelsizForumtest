import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export function createClient(): SupabaseClient {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  const isConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder.supabase.co') &&
    supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder'
  );

  if (!isConfigured) {
    return (({
      auth: { getUser: async () => ({ data: { user: null }, error: null }), getSession: async () => ({ data: { session: null }, error: null }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) },
      from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: new Error('Supabase not configured') }), order: () => ({ limit: () => ({ single: async () => ({ data: null, error: new Error('Supabase not configured') }) }) }) }) }) })
    } as unknown) as SupabaseClient);
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        if (typeof document === 'undefined') return [];
        return document.cookie.split('; ').map((c) => {
          const [name, ...val] = c.split('=');
          return { name, value: val.join('=') };
        });
      },
    },
  });
}



