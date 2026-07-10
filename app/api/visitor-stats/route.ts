import { NextResponse } from 'next/server';
import { getVisitorStats } from '@/app/actions';

export async function GET(req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  // Token'i environment variable'dan almanız daha güvenli, ancak kullanıcının 
  // mevcut Python kodundaki ile eşleşmesi için kontrolü yapıyoruz.
  const expectedToken = process.env.VISITOR_TOKEN || "engelsizforumteknofesttanitim";
  
  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  const stats = await getVisitorStats();
  return NextResponse.json(stats, { headers: corsHeaders });
}
