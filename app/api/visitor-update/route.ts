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

  try {
    // Increment total and active visitors in the single row (where id = true)
    // Using Postgres' atomic increment: UPDATE ... SET count = count + 1
    // Supabase RPC is better for this, but if we can't use RPC, we fetch and update.
    
    // For simplicity, let's use a standard query if possible, or RPC.
    // Let's assume there's a row with id = true
    const { data, error: fetchError } = await supabaseServer
      .from('visitors')
      .select('total_visitors, active_visitors')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .single();

    if (fetchError) {
        // If row doesn't exist, insert it with a dummy mac_address
        const { error: insertError } = await supabaseServer
          .from('visitors')
          .insert({ 
            id: '00000000-0000-0000-0000-000000000000', 
            mac_address: 'GLOBAL_STATS',
            total_visitors: 1,
            active_visitors: 1,
            last_seen: new Date().toISOString()
          });
        if (insertError) {
            console.error('Error inserting visitor stats:', insertError);
            return NextResponse.json({ error: 'Database error' }, { status: 500, headers: corsHeaders });
        }
        return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    const { error: updateError } = await supabaseServer
      .from('visitors')
      .update({ 
        total_visitors: data.total_visitors + 1, 
        active_visitors: data.active_visitors + 1,
        last_seen: new Date().toISOString()
      })
      .eq('id', '00000000-0000-0000-0000-000000000000');

    if (updateError) {
      console.error('Visitor update error (DB):', JSON.stringify(updateError, null, 2));
      return NextResponse.json({ error: 'Database error', details: updateError }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json({ 
        success: true, 
        total_visitors: data.total_visitors + 1, 
        active_visitors: data.active_visitors + 1 
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Visitor update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
