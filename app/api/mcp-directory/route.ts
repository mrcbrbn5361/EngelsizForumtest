import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_MCP_DIRECTORY, MCP_CATEGORIES } from '@/lib/mcp-directory';
import { supabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'all';
  const agentType = searchParams.get('agentType') || 'all';
  const query = (searchParams.get('query') || '').toLowerCase().trim();

  let servers = [...INITIAL_MCP_DIRECTORY];

  // Attempt to fetch fresh servers from Supabase mcp_servers table if present
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabaseServer
        .from('mcp_servers')
        .select('*')
        .order('lastSyncedAt', { ascending: false });

      if (!error && data && data.length > 0) {
        // Merge or replace
        const dbMap = new Map(data.map((item: any) => [item.id || item.slug, item]));
        INITIAL_MCP_DIRECTORY.forEach((initial) => {
          if (!dbMap.has(initial.id)) {
            dbMap.set(initial.id, initial);
          }
        });
        servers = Array.from(dbMap.values());
      }
    }
  } catch (err) {
    console.warn('mcp-directory Supabase fetch warning:', err);
  }

  // Filter by category
  if (category && category !== 'all') {
    servers = servers.filter((s) => s.category === category);
  }

  // Filter by agent type
  if (agentType && agentType !== 'all') {
    servers = servers.filter((s) => s.agentTypes.includes(agentType as any));
  }

  // Filter by search query
  if (query) {
    servers = servers.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.tools.some((t) => t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query))
    );
  }

  return NextResponse.json({
    status: 'success',
    totalCount: servers.length,
    categories: MCP_CATEGORIES,
    servers,
  });
}
