import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { mapTopicToStatus } from '@/lib/mastodon-mappers';

/**
 * Mastodon API: GET /api/v1/trends/statuses
 * Returns trending statuses (returns latest forum discussions as active trends).
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'engelsizforum.com';
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;

  try {
    const { data: topics } = await supabaseServer
      .from('topics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!topics || topics.length === 0) {
      return new NextResponse(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    const authorIds = Array.from(new Set(topics.map((t: any) => t.author_id)));
    const { data: profiles } = await supabaseServer
      .from('profiles')
      .select('*')
      .in('id', authorIds);

    const profilesMap = new Map();
    if (profiles) {
      profiles.forEach((p: any) => {
        profilesMap.set(p.id, p);
      });
    }

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
  } catch (err) {
    console.error('Trends Statuses API error:', err);
    return new NextResponse(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}
