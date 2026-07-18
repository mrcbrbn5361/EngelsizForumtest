import { NextRequest, NextResponse } from 'next/server';

/**
 * Mastodon API: GET /api/v1/accounts/relationships
 * Returns the relationship between the logged-in user and other target user IDs.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  // Mastodon clients can pass multiple id parameters (e.g. id[]=X&id[]=Y) or single id parameter (e.g. id=X)
  const ids: string[] = [];
  
  url.searchParams.forEach((value, key) => {
    if (key === 'id' || key === 'id[]') {
      ids.push(value);
    }
  });

  // Emulate relationship structure
  const relationships = ids.map((id) => ({
    id: id,
    following: false,
    showing_reblogs: true,
    notifying: false,
    languages: [],
    followed_by: false,
    blocking: false,
    blocked_by: false,
    muting: false,
    muting_notifications: false,
    requested: false,
    domain_blocking: false,
    endorsing: false,
    note: ''
  }));

  return new NextResponse(JSON.stringify(relationships), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
