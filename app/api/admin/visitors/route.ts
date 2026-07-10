import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const token = request.headers.get('Authorization');

  if (token !== `Bearer ${process.env.VISITOR_API_TOKEN}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseServer
    .from('visitors')
    .select('total_visitors, active_visitors')
    .single();

  if (error) {
    console.error('Error fetching visitors:', error);
    return NextResponse.json({ error: 'Failed to fetch visitor data' }, { status: 500 });
  }

  return NextResponse.json(data);
}
