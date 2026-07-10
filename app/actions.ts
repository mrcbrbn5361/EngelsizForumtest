'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase-server';

export async function getVisitorStats() {
  const cookieStore = await cookies();
  console.log('getVisitorStats: cookies available:', cookieStore.getAll().length);
  
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

  // const { data: { user }, error: userError } = await supabase.auth.getUser();
  // if (userError) {
  //   console.error('getVisitorStats: getUser error:', userError);
  // }
  // if (!user) {
  //   console.error('getVisitorStats: No user found');
  //   throw new Error('Unauthorized');
  // }

  // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  // if (profile?.role !== 'admin') {
  //   console.error('getVisitorStats: User is not admin', profile);
  //   throw new Error('Unauthorized');
  // }

  const { data, error } = await supabaseServer
    .from('visitors')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Failed to fetch data from visitors table:', error);
  } else {
    console.log('Visitors table data:', data);
  }

  const { count: total_visitors, error: totalError } = await supabaseServer
    .from('visitors')
    .select('*', { count: 'exact', head: true });
    
  if (totalError) {
    console.error('Failed to fetch total visitors:', totalError);
    // Return 0 instead of throwing an error to avoid breaking the UI
    return { total_visitors: 0, active_visitors: 0 };
  }

  const { count: active_visitors, error: activeError } = await supabaseServer
    .from('visitors')
    .select('*', { count: 'exact', head: true });
    // .gt('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Son 5 dakika

  if (activeError) {
    console.error('Failed to fetch active visitors:', activeError);
    // Return 0 instead of throwing an error
    return { total_visitors: total_visitors || 0, active_visitors: 0 };
  }

  const stats = { total_visitors: total_visitors || 0, active_visitors: active_visitors || 0 };
  console.log('Visitor stats fetched:', stats);
  return stats;
}
