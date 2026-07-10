import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token !== "engelsizforumteknofesttanitim") {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  const { mac_address } = await req.json();

  if (!mac_address) {
    return NextResponse.json({ error: 'Missing mac_address' }, { status: 400, headers: corsHeaders });
  }

  try {
    const { error } = await supabaseServer
      .from('visitors')
      .upsert({ mac_address, last_seen: new Date().toISOString() }, { onConflict: 'mac_address' });

    if (error) {
      console.error('Visitor update error (DB):', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: 'Database error', details: error }, { status: 500, headers: corsHeaders });
    }

    console.log('Received visitor update:', mac_address);
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error('Visitor update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}