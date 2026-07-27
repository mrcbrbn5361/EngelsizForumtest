import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Bluesky / AT Protocol Domain Handle Verification Endpoint.
 * Serves the DID for engelsizforum.com domain verification on Bluesky.
 * Access via: https://engelsizforum.com/.well-known/atproto-did
 */
export async function GET(req: NextRequest) {
  const defaultDid = 'did:plc:xzbfz7hhcflj7x3vkmolcodo';
  const did = process.env.BSKY_DID || process.env.NEXT_PUBLIC_BSKY_DID || defaultDid;

  return new NextResponse(did.trim(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
