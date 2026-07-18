import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { mapTopicToStatus } from '@/lib/mastodon-mappers';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * Mastodon API: GET /api/v1/accounts/:id/statuses
 * Returns public topics created by a specific user account.
 */
export async function GET(req: NextRequest, props: Props) {
  const host = req.headers.get('host') || 'engelsizforum.com';
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;
  const { id } = await props.params;

  try {
    // Check if profile exists
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Fetch topics by this author
    const { data: topics, error: topicsError } = await supabaseServer
      .from('topics')
      .select('*')
      .eq('author_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (topicsError) {
      console.error('Error fetching user topics:', topicsError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const statuses = (topics || []).map((topic: any) => {
      return mapTopicToStatus(topic, profile, baseUrl);
    });

    return new NextResponse(JSON.stringify(statuses), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (err: any) {
    console.error('Get Account Statuses API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
