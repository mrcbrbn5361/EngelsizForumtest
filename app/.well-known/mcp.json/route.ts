import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'www.engelsizforum.com';
  const protocol = host.includes('localhost') ? 'http' : 'https';

  return NextResponse.json(
    {
      mcpVersion: '1.0.0',
      protocolVersion: '2024-11-05',
      name: 'EngelsizForum MCP Server',
      description: 'EngelsizForum Türkiye - Erişilebilirlik, ÖTV 2026, Balthazard ve Mevzuat Ajanı',
      endpoints: {
        sse: `${protocol}://${host}/api/mcp`,
        messages: `${protocol}://${host}/api/mcp/messages`,
        jsonrpc: `${protocol}://${host}/api/mcp`,
      },
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
