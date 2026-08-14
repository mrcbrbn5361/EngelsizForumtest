import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_MCP_DIRECTORY, MCP_CATEGORIES, MCPServerEntry } from '@/lib/mcp-directory';
import { supabaseServer } from '@/lib/supabase-server';
import { fetchLiveMCPServersFromSite, getSyncedJSONData } from '@/lib/mcpservers-scraper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'all';
  const agentType = searchParams.get('agentType') || 'all';
  const query = (searchParams.get('query') || '').toLowerCase().trim();
  const live = searchParams.get('live') === 'true';

  const serverMap = new Map<string, MCPServerEntry>();

  // 1. Add base directory entries
  INITIAL_MCP_DIRECTORY.forEach((item) => serverMap.set(item.id, item));

  // 2. Add local synced JSON entries if available
  const syncedJsonItems = getSyncedJSONData();
  syncedJsonItems.forEach((item) => {
    if (!serverMap.has(item.id)) {
      serverMap.set(item.id, item);
    }
  });

  // 3. Attempt to fetch fresh servers from Supabase mcp_servers table if present
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabaseServer
        .from('mcp_servers')
        .select('*')
        .order('lastSyncedAt', { ascending: false });

      if (!error && data && data.length > 0) {
        data.forEach((item: any) => {
          serverMap.set(item.id || item.slug, item);
        });
      }
    }
  } catch (err) {
    console.warn('mcp-directory Supabase fetch warning:', err);
  }

  // 4. Live fetch from https://mcpservers.org/tr/all
  try {
    const liveScraped = await fetchLiveMCPServersFromSite();
    liveScraped.forEach((item) => {
      serverMap.set(item.id, item);
    });
  } catch (err) {
    console.warn('mcp-directory live scrape warning:', err);
  }

  let servers = Array.from(serverMap.values());

  // Filter by category
  if (category && category !== 'all') {
    servers = servers.filter((s) => s.category === category);
  }

  // Filter by agent type
  if (agentType && agentType !== 'all') {
    servers = servers.filter((s) => s.agentTypes && s.agentTypes.includes(agentType as any));
  }

  // Filter by search query
  if (query) {
    servers = servers.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        (s.tools && s.tools.some((t) => t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)))
    );
  }

  return NextResponse.json({
    status: 'success',
    source: 'https://mcpservers.org/tr/all',
    totalCount: servers.length,
    categories: MCP_CATEGORIES,
    servers,
  });
}

