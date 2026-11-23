import { NextResponse } from 'next/server';
import { getVisitorStats, recordVisitor } from '@/app/actions';
import { createRateLimiter, getClientKey } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Expose-Headers': 'Retry-After',
};

const DEVICE_ID_PATTERN = /^[A-Za-z0-9._:-]{1,100}$/;

const readLimiter = createRateLimiter({ limit: 120, windowMs: 60_000 });
const writeLimiter = createRateLimiter({ limit: 30, windowMs: 60_000 });

/**
 * Builds the 429 response sent when a client exceeds its request budget.
 */
function tooManyRequests(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: 'Too Many Requests' },
    { status: 429, headers: { ...corsHeaders, 'Retry-After': String(retryAfterSeconds) } }
  );
}

/**
 * CORS preflight.
 */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * Public, anonymous visitor counts: total devices and devices seen in the last 5 minutes.
 * Authorization headers sent by older kiosk/IoT clients are accepted and ignored.
 */
export async function GET(req: Request) {
  const limit = readLimiter(getClientKey(req));
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  try {
    const stats = await getVisitorStats();
    return NextResponse.json(stats, {
      headers: { ...corsHeaders, 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('API visitor-stats GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}

/**
 * Records a heartbeat for an anonymous device id (no personal data is stored).
 */
export async function POST(req: Request) {
  const limit = writeLimiter(getClientKey(req));
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  let deviceId: unknown;
  try {
    ({ device_id: deviceId } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders });
  }

  if (typeof deviceId !== 'string' || !DEVICE_ID_PATTERN.test(deviceId)) {
    return NextResponse.json(
      { error: 'device_id must be 1-100 characters of letters, digits, ".", "_", ":" or "-"' },
      { status: 400, headers: corsHeaders }
    );
  }

  const result = await recordVisitor(deviceId);
  if (!result.success) {
    return NextResponse.json({ error: 'Visitor could not be recorded' }, { status: 503, headers: corsHeaders });
  }
  return NextResponse.json({ success: true }, { headers: corsHeaders });
}
