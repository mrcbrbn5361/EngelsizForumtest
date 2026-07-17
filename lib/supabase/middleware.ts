import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-project.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-url.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project') &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== ''
);

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (!isSupabaseConfigured) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // refreshing the auth token
  await supabase.auth.getUser();

  return supabaseResponse;
}
