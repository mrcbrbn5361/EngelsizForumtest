import { NextRequest, NextResponse } from 'next/server';

/**
 * Mastodon API: GET /api/v1/custom_emojis
 * Returns custom emojis used on the server (none by default).
 */
export async function GET(req: NextRequest) {
  return new NextResponse(JSON.stringify([]), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
