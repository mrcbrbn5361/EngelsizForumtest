import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { POST as handleMcpPost, OPTIONS as handleMcpOptions } from '../route';

export async function POST(req: NextRequest) {
  return handleMcpPost(req);
}

export async function OPTIONS() {
  return handleMcpOptions();
}
