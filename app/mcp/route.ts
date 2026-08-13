import { NextRequest } from 'next/server';
import { GET as handleMcpGet, POST as handleMcpPost, OPTIONS as handleMcpOptions } from '../api/mcp/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleMcpGet(req);
}

export async function POST(req: NextRequest) {
  return handleMcpPost(req);
}

export async function OPTIONS() {
  return handleMcpOptions();
}
