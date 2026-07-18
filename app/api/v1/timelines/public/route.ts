import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { mapTopicToStatus } from '@/lib/mastodon-mappers';

/**
 * Mastodon API: GET /api/v1/timelines/public
 * Returns the public timeline (the latest topics from EngelsizForum).
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'engelsizforum.com';
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;

  try {
    // Robust query: Fetch topics first
    const { data: topics, error: topicsError } = await supabaseServer
      .from('topics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (topicsError) {
      console.error('Error fetching topics for timeline:', topicsError);
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

    // Extract all unique author IDs
    const authorIds = Array.from(new Set(topics.map((t: any) => t.author_id)));

    // Fetch corresponding profiles
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

    // Map topics to Mastodon Statuses
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
    console.error('Public timeline API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
