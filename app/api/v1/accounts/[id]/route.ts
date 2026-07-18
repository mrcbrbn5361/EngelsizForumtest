import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { mapProfileToAccount } from '@/lib/mastodon-mappers';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * Mastodon API: GET /api/v1/accounts/:id
 * Returns account details for a specific user ID.
 */
export async function GET(req: NextRequest, props: Props) {
  const host = req.headers.get('host') || 'engelsizforum.com';
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;
  const { id } = await props.params;

  try {
    const { data: profile, error } = await supabaseServer
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const account = mapProfileToAccount(profile, baseUrl);

    return new NextResponse(JSON.stringify(account), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (err: any) {
    console.error('Get Account API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
