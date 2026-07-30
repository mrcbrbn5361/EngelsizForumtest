import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'engelsizforum.com';
  return NextResponse.json(
    {
      links: [
        {
          rel: 'http://nodeinfo.diaspora.software/ns/schema/2.0',
          href: `https://${host}/nodeinfo/2.0`,
        },
      ],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
