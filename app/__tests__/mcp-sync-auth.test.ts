import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const upsert = vi.fn(async () => ({ error: null }));
vi.mock('@/lib/supabase-server', () => ({
  supabaseServer: { from: () => ({ upsert }) },
}));

const { GET, POST } = await import('@/app/api/mcp-sync/route');

/**
 * Builds a request to the sync endpoint with an optional Authorization header.
 */
function request(method: 'GET' | 'POST', auth?: string) {
  return new NextRequest('https://example.test/api/mcp-sync', {
    method,
    headers: auth ? { authorization: auth } : {},
  });
}

describe('/api/mcp-sync authorization', () => {
  afterEach(() => {
    delete process.env.CRON_SECRET;
    upsert.mockClear();
  });

  it('is disabled when CRON_SECRET is not configured', async () => {
    const res = await GET(request('GET', 'Bearer engelsizforum-mcp-sync-secret'));
    expect(res.status).toBe(401);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('rejects requests without the secret', async () => {
    process.env.CRON_SECRET = 's3cret';
    expect((await GET(request('GET'))).status).toBe(401);
    expect((await POST(request('POST', 'Bearer wrong'))).status).toBe(401);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('accepts the configured secret', async () => {
    process.env.CRON_SECRET = 's3cret';
    const res = await POST(request('POST', 'Bearer s3cret'));
    expect(res.status).toBe(200);
  });
});
