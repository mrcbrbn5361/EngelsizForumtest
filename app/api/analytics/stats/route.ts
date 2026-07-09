import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: 'Missing or invalid Authorization header.' 
      }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let isAdmin = false;

    if (token.startsWith('sk_')) {
      // It's a custom API Key
      const { data: keyVerifyData, error: keyVerifyError } = await supabase.rpc('verify_api_key', { p_key: token });
      
      if (keyVerifyError || !keyVerifyData || keyVerifyData.length === 0) {
        return NextResponse.json({ error: 'Unauthorized', message: 'Invalid or inactive API key.' }, { status: 401 });
      }
      
      const keyInfo = keyVerifyData[0];
      if (keyInfo.user_role === 'admin') {
        isAdmin = true;
      } else {
        return NextResponse.json({ error: 'Forbidden', message: 'Admin access required.' }, { status: 403 });
      }
    } else {
      // It's a normal user session JWT
      const authSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      );

      const { data: { user }, error: userError } = await authSupabase.auth.getUser();
      
      if (userError || !user) {
        return NextResponse.json({ error: 'Unauthorized', message: 'Invalid or expired token.' }, { status: 401 });
      }

      // Verify admin role
      const { data: profile, error: profileError } = await authSupabase.from('profiles').select('role').eq('id', user.id).single();
      if (profileError || profile?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden', message: 'Admin access required.' }, { status: 403 });
      }
      
      isAdmin = true;
    }
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden', message: 'Admin access required.' }, { status: 403 });
    }
    
    // Total visitors
    const { count: totalVisitors, error: totalError } = await supabase
      .from('analytics_visitors')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Active visitors
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count: activeVisitors, error: activeError } = await supabase
      .from('analytics_visitors')
      .select('*', { count: 'exact', head: true })
      .gte('last_active_at', fiveMinsAgo);

    if (activeError) throw activeError;

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
