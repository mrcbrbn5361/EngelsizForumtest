import { NextRequest, NextResponse } from 'next/server';

/**
 * NodeInfo discovery endpoint.
 * Tells federated networks where to find server metadata.
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'engelsizforum.com';
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;

  const nodeinfoDiscovery = {
    links: [
      {
        rel: 'http://nodeinfo.diaspora.gene.ch/v2.0',
        href: `${baseUrl}/nodeinfo/2.0`
      }
    ]
  };

  return new NextResponse(JSON.stringify(nodeinfoDiscovery), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
