import { NextRequest, NextResponse } from 'next/server';
import { verifyMastodonRequest } from '@/lib/mastodon-auth';
import { mapProfileToAccount } from '@/lib/mastodon-mappers';

/**
 * Mastodon API: GET /api/v1/accounts/verify_credentials
 * Verifies the OAuth bearer token and returns the authenticated user's account details.
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'engelsizforum.com';
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;

  try {
    const profile = await verifyMastodonRequest(req);
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    console.error('Verify Credentials API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
