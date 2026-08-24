import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

/**
 * Returns a server-side Supabase client using the service role key.
 * Used strictly for privileged server operations (e.g. background tasks, admin actions).
 */
export function getSupabaseServer(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables for server-side privileged operations.');
  }

  cachedClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

/**
 * Checks if a user possesses admin or moderator privileges on the server side.
 */
export async function verifyUserRole(userId: string): Promise<'admin' | 'moderator' | 'user' | null> {
  if (!userId) return null;
  try {
    const client = getSupabaseServer();
    const { data, error } = await client
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return (data.role as any) || 'user';
  } catch (err) {
    console.error('Error verifying user role:', err);
    return null;
  }
}

// Proxy export for backward compatibility so existing imports `supabaseServer.from(...)` work seamlessly
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseServer();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

