import { createBrowserClient } from '@supabase/ssr';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseUrl = (rawUrl && rawUrl.trim().length > 0) ? rawUrl : 'https://placeholder.supabase.co';
export const supabaseAnonKey = (rawKey && rawKey.trim().length > 0) ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

/**
 * Utility boolean to check if Supabase is properly configured with live credentials
 */
export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  !rawUrl.includes('your-project-url') &&
  !rawUrl.includes('placeholder.supabase.co') &&
  rawKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder'
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
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);


