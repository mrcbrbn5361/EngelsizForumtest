import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

/**
 * Mastodon API: GET /api/v1/instance
 * Returns information about the instance, used by Mastodon clients to verify compatibility.
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'engelsizforum.com';
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;

  try {
    const { count: usersCount } = await supabaseServer
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: topicsCount } = await supabaseServer
      .from('topics')
      .select('*', { count: 'exact', head: true });

    const instanceData = {
      uri: host,
      title: 'EngelsizForum',
      short_description: 'Engelli bireyler için %100 erişilebilir, yapay zeka destekli ve kapsayıcı topluluk platformu.',
      description: 'Herkes için bariyersiz, tam erişilebilir, yapay zeka destekli forum platformu. Engelli bireyler için optimize edilmiş, SEO ve GEO uyumlu topluluk alanı.',
      email: 'destek@engelsizforum.com',
      version: '4.0.0', // Emulate modern Mastodon version so modern clients work
      urls: {
        streaming_api: `wss://${host}/api/streaming`
      },
      stats: {
        user_count: usersCount || 0,
        status_count: topicsCount || 0,
        domain_count: 0
      },
      thumbnail: `${baseUrl}/og-image.png`,
      languages: ['tr'],
      registrations: true,
      approval_required: false,
      invites_enabled: false,
      configuration: {
        statuses: {
          max_characters: 500,
          max_media_attachments: 4,
          characters_reserved_per_url: 23
        },
        media_attachments: {
          supported_mime_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          image_size_limit: 10485760,
          image_matrix_limit: 16777216,
          video_size_limit: 41943040,
          video_frame_rate_limit: 60,
          video_matrix_limit: 2304000
        },
        polls: {
          max_options: 4,
          max_characters_per_option: 50,
          min_expiration: 300,
          max_expiration: 2678400
        }
      },
      contact_account: null,
      rules: [
        { id: '1', text: 'Erişilebilirlik kurallarına ve kapsayıcı dil standartlarına uyun.' },
        { id: '2', text: 'Saygılı, yapıcı ve destekleyici bir topluluk ortamı oluşturun.' }
      ]
    };

    return new NextResponse(JSON.stringify(instanceData), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (err) {
    console.error('Instance API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
