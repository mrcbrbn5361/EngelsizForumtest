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

  const { data, error } = await supabaseServer.from('visitors').select('total_visitors, active_visitors');
  if (error) {
    console.error('Failed to fetch data from visitors table:', error);
    throw new Error('Failed to fetch data: ' + error.message);
  }

  if (!data || data.length === 0) {
    return { total_visitors: 0, active_visitors: 0 };
  }

  console.log('Visitor stats fetched:', data[0]);
  return data[0];
}
