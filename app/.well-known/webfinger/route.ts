import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

/**
 * WebFinger endpoint (RFC 7033) for Mastodon and ActivityPub discovery.
 * Resolves user handles like acct:username@domain to their profile resource.
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'engelsizforum.com';
  const url = new URL(req.url);
  const resource = url.searchParams.get('resource');

  if (!resource) {
    return NextResponse.json({ error: 'Missing resource parameter' }, { status: 400 });
  }

  // Parse username from resource, e.g. acct:username@host or acct:username
  let username = '';
  if (resource.startsWith('acct:')) {
    const cleanResource = resource.slice(5);
    username = cleanResource.split('@')[0];
  } else {
    username = resource.split('@')[0];
  }

  if (!username) {
    return NextResponse.json({ error: 'Invalid resource format' }, { status: 400 });
  }

  try {
    // Query profiles table to verify user existence
    const { data: profile, error } = await supabaseServer
      .from('profiles')
      .select('id, username, full_name')
      .eq('username', username)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}`;

    const webfingerResponse = {
      subject: `acct:${profile.username}@${host}`,
      aliases: [
        `${baseUrl}/profile/${profile.id}`,
        `${baseUrl}/@${profile.username}`
      ],
      links: [
        {
          rel: 'http://webfinger.net/rel/profile-page',
          type: 'text/html',
          href: `${baseUrl}/profile/${profile.id}`
        },
        {
          rel: 'self',
          type: 'application/activity+json',
          href: `${baseUrl}/api/v1/accounts/${profile.id}`
        }
      ]
    };

    return new NextResponse(JSON.stringify(webfingerResponse), {
      headers: {
        'Content-Type': 'application/jrd+json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (err: any) {
    console.error('WebFinger error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
