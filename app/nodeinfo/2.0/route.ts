import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * NodeInfo 2.0 schema endpoint.
 * Provides statistics and metadata about the instance.
 */
export async function GET(req: NextRequest) {
  try {
    // Fetch total profiles count
    const { count: usersCount } = await supabaseServer
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Fetch total topics count
    const { count: topicsCount } = await supabaseServer
      .from('topics')
      .select('*', { count: 'exact', head: true });

    const nodeinfoData = {
      version: '2.0',
      software: {
        name: 'engelsizforum',
        version: '1.0.0'
      },
      protocols: [
        'activitypub'
      ],
      services: {
        inbound: [],
        outbound: []
      },
      openRegistrations: true,
      usage: {
        users: {
          total: usersCount || 0,
          activeHalfyear: usersCount || 0,
          activeMonth: usersCount || 0
        },
        localPosts: topicsCount || 0
      },
      metadata: {
        nodeName: 'EngelsizForum',
        nodeDescription: 'Herkes için bariyersiz, tam erişilebilir topluluk platformu.',
        languages: ['tr']
      }
    };

    return new NextResponse(JSON.stringify(nodeinfoData), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (err) {
    console.error('NodeInfo 2.0 error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
