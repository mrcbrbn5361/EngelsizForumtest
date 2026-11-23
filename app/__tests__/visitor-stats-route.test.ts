import { beforeEach, describe, expect, it, vi } from 'vitest';

const recordVisitor = vi.fn(async () => ({ success: true }));
const getVisitorStats = vi.fn(async () => ({ total_visitors: 5, active_visitors: 2 }));

vi.mock('@/app/actions', () => ({ recordVisitor, getVisitorStats }));

const { GET, POST } = await import('@/app/api/visitor-stats/route');

let counter = 0;

/**
 * Builds a request from a fresh address so each test starts with an empty budget.
 */
function post(body: unknown, ip = `198.51.100.${++counter}`) {
  return new Request('https://example.com/api/visitor-stats', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('/api/visitor-stats', () => {
  beforeEach(() => {
    recordVisitor.mockClear();
    getVisitorStats.mockClear();
  });

  it('records a valid heartbeat', async () => {
    const res = await POST(post({ device_id: 'kiosk-01' }));
    expect(res.status).toBe(200);
    expect(recordVisitor).toHaveBeenCalledWith('kiosk-01');
  });

  it('rejects invalid ids without touching the database', async () => {
    expect((await POST(post({ device_id: 'bad id!' }))).status).toBe(400);
    expect((await POST(post('not json'))).status).toBe(400);
    expect(recordVisitor).not.toHaveBeenCalled();
  });

  it('answers 429 with Retry-After once one address exceeds its write budget', async () => {
    const ip = '203.0.113.50';
    for (let i = 0; i < 30; i++) expect((await POST(post({ device_id: `d-${i}` }, ip))).status).toBe(200);
    const blocked = await POST(post({ device_id: 'd-21' }, ip));
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('Retry-After'))).toBeGreaterThan(0);
    expect(recordVisitor).toHaveBeenCalledTimes(30);
  });

  it('does not let one address use up another address\'s budget', async () => {
    for (let i = 0; i < 31; i++) await POST(post({ device_id: `x-${i}` }, '203.0.113.60'));
    expect((await POST(post({ device_id: 'ok' }, '203.0.113.61'))).status).toBe(200);
  });

  it('limits reads too and skips the database when blocked', async () => {
    const ip = '203.0.113.70';
    const get = () => GET(new Request('https://example.com/api/visitor-stats', { headers: { 'x-forwarded-for': ip } }));
    for (let i = 0; i < 120; i++) expect((await get()).status).toBe(200);
    expect((await get()).status).toBe(429);
    expect(getVisitorStats).toHaveBeenCalledTimes(120);
  });

  it('keeps the CORS headers on a 429 so browser clients can read it', async () => {
    const ip = '203.0.113.80';
    for (let i = 0; i < 30; i++) await POST(post({ device_id: `c-${i}` }, ip));
    const blocked = await POST(post({ device_id: 'c-over' }, ip));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('answers 503 when the heartbeat cannot be stored', async () => {
    recordVisitor.mockResolvedValueOnce({ success: false });
    const res = await POST(post({ device_id: 'kiosk-02' }));
    expect(res.status).toBe(503);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('still serves a request that carries no proxy headers', async () => {
    const res = await POST(new Request('https://example.com/api/visitor-stats', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ device_id: 'local-dev' }),
    }));
    expect(res.status).toBe(200);
  });

  it('exposes Retry-After to cross-origin clients', async () => {
    const ip = '203.0.113.90';
    for (let i = 0; i < 30; i++) await POST(post({ device_id: `e-${i}` }, ip));
    const blocked = await POST(post({ device_id: 'e-over' }, ip));
    expect(blocked.headers.get('Access-Control-Expose-Headers')).toContain('Retry-After');
  });

  it('answers 500 instead of zeros when the stats cannot be read', async () => {
    getVisitorStats.mockRejectedValueOnce(new Error('Visitor stats unavailable'));
    const res = await GET(new Request('https://example.com/api/visitor-stats', { headers: { 'x-forwarded-for': '203.0.113.95' } }));
    expect(res.status).toBe(500);
  });
});
