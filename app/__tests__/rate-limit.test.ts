import { describe, expect, it } from 'vitest';
import { createRateLimiter, getClientKey } from '@/lib/rate-limit';

describe('createRateLimiter', () => {
  it('allows up to the limit and then blocks with a retry hint', () => {
    let t = 1_000;
    const check = createRateLimiter({ limit: 3, windowMs: 60_000, now: () => t });
    expect(check('a').allowed).toBe(true);
    expect(check('a').allowed).toBe(true);
    expect(check('a').allowed).toBe(true);
    t += 10_000;
    const blocked = check('a');
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(50);
  });

  it('counts each key separately', () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000, now: () => 0 });
    expect(check('a').allowed).toBe(true);
    expect(check('b').allowed).toBe(true);
    expect(check('a').allowed).toBe(false);
  });

  it('opens a fresh window once the old one has expired', () => {
    let t = 0;
    const check = createRateLimiter({ limit: 1, windowMs: 1_000, now: () => t });
    expect(check('a').allowed).toBe(true);
    expect(check('a').allowed).toBe(false);
    t = 1_000;
    expect(check('a').allowed).toBe(true);
  });

  it('keeps memory bounded by evicting old keys', () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 3, now: () => 0 });
    ['a', 'b', 'c', 'd'].forEach(key => check(key));
    expect(check('a').allowed).toBe(true);
    expect(check('d').allowed).toBe(false);
  });
});

describe('createRateLimiter eviction order', () => {
  it('does not evict a key whose window just restarted', () => {
    let t = 0;
    const check = createRateLimiter({ limit: 1, windowMs: 1_000, maxKeys: 2, now: () => t });
    check('a');
    t = 500;
    check('b');
    t = 1_000;
    expect(check('a').allowed).toBe(true);
    t = 1_100;
    check('c');
    t = 1_200;
    expect(check('a').allowed).toBe(false);
  });
});

describe('getClientKey', () => {
  const request = (headers: Record<string, string>) => new Request('https://example.com', { headers });

  it('uses the right-most forwarded address and ignores a client-supplied prefix', () => {
    expect(getClientKey(request({ 'x-forwarded-for': '1.2.3.4, 203.0.113.7' }))).toBe('203.0.113.7');
    expect(getClientKey(request({ 'x-forwarded-for': '203.0.113.7' }))).toBe('203.0.113.7');
  });

  it('falls back to x-real-ip and then to the shared unknown key', () => {
    expect(getClientKey(request({ 'x-real-ip': '198.51.100.2' }))).toBe('198.51.100.2');
    expect(getClientKey(request({}))).toBe('unknown');
  });

  it('sends garbage and oversized headers to the unknown key instead of creating keys', () => {
    expect(getClientKey(request({ 'x-forwarded-for': 'not-an-address' }))).toBe('unknown');
    expect(getClientKey(request({ 'x-forwarded-for': 'a'.repeat(5000) }))).toBe('unknown');
  });

  it('removes a port from IPv4 and bracketed IPv6 addresses', () => {
    expect(getClientKey(request({ 'x-forwarded-for': '203.0.113.7:51234' }))).toBe('203.0.113.7');
    expect(getClientKey(request({ 'x-forwarded-for': '[2001:db8:abcd:12::1]:443' }))).toBe('2001:0db8:abcd:0012::/64');
  });

  it('collapses every address inside one IPv6 /64 into the same key', () => {
    const a = getClientKey(request({ 'x-forwarded-for': '2001:db8:abcd:12::1' }));
    const b = getClientKey(request({ 'x-forwarded-for': '2001:db8:abcd:12:ffff:eeee:dddd:1' }));
    const other = getClientKey(request({ 'x-forwarded-for': '2001:db8:abcd:13::1' }));
    expect(a).toBe('2001:0db8:abcd:0012::/64');
    expect(b).toBe(a);
    expect(other).not.toBe(a);
  });

  it('treats an IPv4-mapped IPv6 address as its IPv4 form', () => {
    expect(getClientKey(request({ 'x-forwarded-for': '::ffff:203.0.113.9' }))).toBe('203.0.113.9');
  });
});
