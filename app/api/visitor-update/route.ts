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

  const { visitor_count } = await req.json();

  // For now, let's just log it if we can't find the table.
  // We should ideally update the database.
  try {
    // Assuming table exists
    // const { error } = await supabaseServer.from('visitors').update(...)
    console.log('Received visitor update:', visitor_count);
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error('Visitor update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}