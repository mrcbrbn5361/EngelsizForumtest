import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

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

    const domain = host;
    const profileUrl = `https://${domain}/profile/${profile.username}`;
    const actorUrl = `https://${domain}/api/users/${profile.username}`;

    return NextResponse.json(
      {
        subject: `acct:${profile.username}@${domain}`,
        aliases: [profileUrl, actorUrl],
        links: [
          {
            rel: 'http://webfinger.net/rel/profile-page',
            type: 'text/html',
            href: profileUrl,
          },
          {
            rel: 'self',
            type: 'application/activity+json',
            href: actorUrl,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/jrd+json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err: any) {
    console.error('WebFinger Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
