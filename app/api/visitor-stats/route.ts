import { NextResponse } from 'next/server';
import { getVisitorStats, recordVisitor } from '@/app/actions';

export async function OPTIONS(req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  const authHeader = req.headers.get('Authorization');
  const expectedToken = process.env.VISITOR_API_TOKEN || "engelsizforumteknofesttanitim";
  
  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  try {
    const stats = await getVisitorStats();
    return NextResponse.json(stats, { headers: corsHeaders });
  } catch (error) {
    console.error('API visitor-stats GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  const authHeader = req.headers.get('Authorization');
  const expectedToken = process.env.VISITOR_API_TOKEN || "engelsizforumteknofesttanitim";
  
  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  try {
    const { device_id } = await req.json();
    if (!device_id) {
      return NextResponse.json({ error: 'device_id required' }, { status: 400, headers: corsHeaders });
    }
    await recordVisitor(device_id);
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error('API visitor-stats POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}
