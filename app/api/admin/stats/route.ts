import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API Route for Raspberry Pi and Admin Dashboards
 * Returns live and total visitor statistics.
 * Protected by ADMIN_STATS_API_KEY.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiKey = request.headers.get('x-api-key') || searchParams.get('key');
  
  // Security Check
  let expectedKey = process.env.ADMIN_STATS_API_KEY;
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Try to get key from database first
    const { data: dbKeyData } = await supabase
      .from('api_settings')
      .select('key_value')
      .eq('key_name', 'admin_stats_token')
      .single();

    if (dbKeyData?.key_value) {
      expectedKey = dbKeyData.key_value;
    }
    
    if (!expectedKey) {
      return NextResponse.json(
        { error: 'API not configured. Please set ADMIN_STATS_API_KEY or configure in database.' },
        { status: 500 }
      );
    }
    
    if (apiKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid API Key.' },
        { status: 401 }
      );
    }

    // Call the RPC function to get stats securely
    // This function must be created in Supabase (see Felix's task)
    const { data, error } = await supabase.rpc('get_admin_stats');

    if (error) {
      console.error('Error fetching admin stats:', error);
      
      // Fallback logic in case the RPC doesn't exist yet or fails
      // Felix's fallback to ensure the Raspberry Pi still gets some data
      const { count: totalVisitors } = await supabase
        .from('analytics_visitors')
        .select('*', { count: 'exact', head: true });

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count: activeVisitors } = await supabase
        .from('analytics_visitors')
        .select('*', { count: 'exact', head: true })
        .gt('last_active_at', fiveMinutesAgo);

      return NextResponse.json({
        total_visitors: totalVisitors || 0,
        active_visitors: activeVisitors || 0,
        active_members: 0, // Fallback can't easily count members without complex query
        active_guests: activeVisitors || 0,
        timestamp: new Date().toISOString(),
        is_fallback: true
      });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Stats API error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
