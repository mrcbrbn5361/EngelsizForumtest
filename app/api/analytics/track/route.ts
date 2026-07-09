import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { visitorId, userId } = await request.json();
    
    if (!visitorId) {
      return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Call the secure RPC function to track the visitor
    // Passing p_user_id to track members vs guests
    const { error } = await supabase.rpc('track_visitor', { 
      p_session_id: visitorId,
      p_user_id: userId || null
    });

    if (error) {
      console.error('Analytics tracking error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Analytics POST error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
