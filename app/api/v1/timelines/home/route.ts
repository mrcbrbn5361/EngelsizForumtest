import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { verifyMastodonRequest } from '@/lib/mastodon-auth';
import { mapTopicToStatus } from '@/lib/mastodon-mappers';

/**
 * Mastodon API: GET /api/v1/timelines/home
 * Returns the home timeline for the authenticated user.
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'engelsizforum.com';
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;

  try {
    // Authenticate the request
    const userProfile = await verifyMastodonRequest(req);
    if (!userProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch latest topics
    const { data: topics, error: topicsError } = await supabaseServer
      .from('topics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (topicsError) {
      console.error('Error fetching topics for home timeline:', topicsError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!topics || topics.length === 0) {
      return new NextResponse(JSON.stringify([]), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Fetch author profiles
    const authorIds = Array.from(new Set(topics.map((t: any) => t.author_id)));
    const { data: profiles, error: profilesError } = await supabaseServer
      .from('profiles')
      .select('*')
      .in('id', authorIds);

    const profilesMap = new Map();
    if (profiles) {
      profiles.forEach((p: any) => {
        profilesMap.set(p.id, p);
      });
    }

    // Map to Mastodon Statuses
    const statuses = topics.map((topic: any) => {
      const author = profilesMap.get(topic.author_id) || { id: topic.author_id, username: 'bilinmeyen' };
      return mapTopicToStatus(topic, author, baseUrl);
    });

    return new NextResponse(JSON.stringify(statuses), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (err: any) {
    console.error('Home timeline API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
