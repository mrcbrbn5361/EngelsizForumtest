import { isIP } from 'node:net';

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  maxKeys?: number;
  now?: () => number;
}

/**
 * Creates a fixed-window, in-memory rate limiter keyed by an arbitrary string.
 * State lives in one server instance, so on a serverless host it only slows a flood
 * from a single source down; it is not a global quota. Memory is bounded by `maxKeys`.
 * Every bucket shares one window length and is re-inserted when its window restarts, so
 * the map's oldest entry is always the one closest to expiring and is evicted first.
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const { limit, windowMs, maxKeys = 5000, now = Date.now } = options;
  const buckets = new Map<string, { count: number; resetAt: number }>();

  return function check(key: string): RateLimitResult {
    const currentTime = now();
    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= currentTime) {
      buckets.delete(key);
      while (buckets.size >= maxKeys) {
        const oldest = buckets.keys().next().value;
        if (oldest === undefined) break;
        buckets.delete(oldest);
      }
      bucket = { count: 0, resetAt: currentTime + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    if (bucket.count > limit) {
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - currentTime) / 1000)) };
    }
    return { allowed: true, retryAfterSeconds: 0 };
  };
}

/**
 * Removes a port and brackets from a forwarded address, e.g. `1.2.3.4:80` or `[::1]:443`.
 */
function stripPort(value: string): string {
  const bracketed = /^\[([^\]]+)\](?::\d+)?$/.exec(value);
  if (bracketed) return bracketed[1];
  if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(value)) return value.slice(0, value.lastIndexOf(':'));
  return value;
}

/**
 * Reduces a valid IPv6 address to its /64 prefix, since one subscriber normally owns a
 * whole /64 and could otherwise rotate addresses to dodge the limit. IPv4-mapped
 * addresses collapse to their IPv4 form.
 */
function ipv6Identity(address: string): string {
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(address);
  if (mapped) return mapped[1];

  const [head, tail] = address.split('::');
  const headGroups = head ? head.split(':') : [];
  const tailGroups = tail ? tail.split(':') : [];
  const missing = tail === undefined ? 0 : Math.max(0, 8 - headGroups.length - tailGroups.length);
  const groups = [...headGroups, ...Array<string>(missing).fill('0'), ...tailGroups];
  return `${groups.slice(0, 4).map(group => group.toLowerCase().padStart(4, '0')).join(':')}::/64`;
}

/**
 * Returns the caller's rate-limit identity: an IPv4 address or an IPv6 /64 prefix.
 * A proxy appends the address it saw to the right of `x-forwarded-for`, while anything
 * to the left may be written by the client, so the right-most entry is used. This assumes
 * exactly one trusted proxy, as on Vercel (not verifiable from this repository). Falls
 * back to `x-real-ip`, and to a shared `unknown` key when no valid address is present.
 */
export function getClientKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const candidate = forwarded?.split(',').pop()?.trim() || req.headers.get('x-real-ip')?.trim() || '';
  const address = stripPort(candidate).split('%')[0];
  const family = isIP(address);
  if (family === 4) return address;
  if (family === 6) return ipv6Identity(address);
  return 'unknown';
}
