import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * Builds a request that carries no cookies and no authorization header.
 */
function anonymous(url: string, init?: RequestInit) {
  return new NextRequest(`http://localhost${url}`, init);
}

describe('remaining API routes answer without a session', () => {
  it('GET /api/discussions lists topics read-only', async () => {
    const { GET } = await import('@/app/api/discussions/route');
    const res = await GET(anonymous('/api/discussions'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('success');
    expect(Array.isArray(body.discussions)).toBe(true);
  });

  it('GET /api/brand/logo returns an SVG', async () => {
    const { GET } = await import('@/app/api/brand/logo/route');
    const res = await GET(anonymous('/api/brand/logo'));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('svg');
  });

  it('GET /api/brand/button returns an SVG', async () => {
    const { GET } = await import('@/app/api/brand/button/route');
    const res = await GET(anonymous('/api/brand/button'));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('svg');
  });

  it('GET /api/og returns an image', async () => {
    const { GET } = await import('@/app/api/og/route');
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('image');
  });

  it('POST /api/v1/calculate/balthazard calculates without touching the database', async () => {
    const { POST } = await import('@/app/api/v1/calculate/balthazard/route');
    const res = await POST(anonymous('/api/v1/calculate/balthazard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rates: [40, 20] }),
    }));
    expect(res.status).toBe(200);
  });

  it('POST /api/v1/calculate/balthazard rejects an empty list', async () => {
    const { POST } = await import('@/app/api/v1/calculate/balthazard/route');
    const res = await POST(anonymous('/api/v1/calculate/balthazard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rates: [] }),
    }));
    expect(res.status).toBe(400);
  });
});
