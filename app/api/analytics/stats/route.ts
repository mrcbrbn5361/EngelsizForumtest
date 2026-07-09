import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    console.log('Authorization Header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: 'Missing or invalid Authorization header. Please provide an Admin Bearer token.' 
      }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Initialize Supabase client with the provided token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } }
      }
    );

    // Verify token and user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Invalid or expired token.' }, { status: 401 });
    }

    // Now we attempt to read from analytics_visitors. 
    // The RLS policy "Admins can view analytics" will ONLY allow the query to succeed if the user is an admin.
    // So we don't even need to query the profile table manually here, we just run the count queries.
    
    // Total visitors
    const { count: totalVisitors, error: totalError } = await supabase
      .from('analytics_visitors')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      // If RLS blocked it, it might return an error or just 0 count depending on setup.
      // Usually it returns 0. Let's explicitly check the profile to provide a better error message if they are not admin.
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden', message: 'Admin access required to view analytics.' }, { status: 403 });
      }
      throw totalError;
    }

    // Active visitors (active within the last 5 minutes)
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count: activeVisitors, error: activeError } = await supabase
      .from('analytics_visitors')
      .select('*', { count: 'exact', head: true })
      .gte('last_active_at', fiveMinsAgo);

    if (activeError) throw activeError;

    // Additional safeguard check for admin role, in case RLS is missing or misconfigured
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required to view analytics.' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: {
        active_visitors: activeVisitors || 0,
        total_visitors: totalVisitors || 0,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
