'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase-server';

/**
 * Fetches total and active visitor statistics.
 * @returns {Promise<{ total_visitors: number; active_visitors: number }>}
 */
export async function getVisitorStats() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { count: totalCount, error: totalError } = await supabaseServer
    .from('visitors')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('Failed to fetch total visitors:', totalError);
  }

  // Son 5 dakika içinde aktif olanları say
  const { count: activeCount, error: activeError } = await supabaseServer
    .from('visitors')
    .select('*', { count: 'exact', head: true })
    .gt('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString());

  if (activeError) {
    console.error('Failed to fetch active visitors:', activeError);
  }
  
  return { 
    total_visitors: totalCount || 0, 
    active_visitors: activeCount || 0 
  };
}

/**
 * Records or updates a visitor activity heartbeat using a device ID.
 * @param {string} deviceId 
 */
export async function recordVisitor(deviceId: string) {
  if (!deviceId) return;

  const { error } = await supabaseServer
    .from('visitors')
    .upsert(
      { device_id: deviceId, last_seen: new Date().toISOString() },
      { onConflict: 'device_id' }
    );

  if (error) {
    console.error('Error recording visitor:', error);
    throw error;
  }
  return { success: true };
}

