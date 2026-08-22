import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseUrl = rawUrl.trim();
export const supabaseAnonKey = rawKey.trim();

/**
 * Utility boolean to check if Supabase is properly configured with live credentials
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-url') &&
  !supabaseUrl.includes('placeholder.supabase.co') &&
  supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder'
);

/**
 * Checks connection health to the Supabase instance
 */
export async function checkSupabaseHealth(): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase URL ve Anon Key ortam değişkenleri yapılandırılmamış.' };
  }
  try {
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      return { ok: false, message: error.message };
    }
    return { ok: true, message: 'Supabase bağlantısı sağlıklı.' };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Bağlantı hatası' };
  }
}

/**
 * Centered Supabase SSR Browser Client
 * Initialized with @supabase/ssr to keep cookies in sync with Next.js middleware and server actions.
 */
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : (({
      auth: { getUser: async () => ({ data: { user: null }, error: null }), getSession: async () => ({ data: { session: null }, error: null }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) },
      from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: new Error('Supabase not configured') }), order: () => ({ limit: () => ({ single: async () => ({ data: null, error: new Error('Supabase not configured') }) }) }) }) }) })
    } as unknown) as SupabaseClient);



