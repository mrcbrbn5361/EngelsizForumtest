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

  const { count: totalCount, error: totalError } = await supabaseServer
    .from('visitors')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('Failed to fetch total visitors:', totalError);
  }

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
