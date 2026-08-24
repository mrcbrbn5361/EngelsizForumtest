import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseServer } from '@/lib/supabase-server';

/**
 * Mastodon API: POST /oauth/token
 * Exchanges an authorization code for an OAuth access token with strict server-side atomic validation.
 */
export async function POST(req: NextRequest) {
  try {
    let clientId = '';
    let clientSecret = '';
    let grantType = '';
    let code = '';
    let redirectUri = '';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      clientId = body.client_id || '';
      clientSecret = body.client_secret || '';
      grantType = body.grant_type || '';
      code = body.code || '';
      redirectUri = body.redirect_uri || '';
    } else {
      const formData = await req.formData();
      clientId = (formData.get('client_id') as string) || '';
      clientSecret = (formData.get('client_secret') as string) || '';
      grantType = (formData.get('grant_type') as string) || '';
      code = (formData.get('code') as string) || '';
      redirectUri = (formData.get('redirect_uri') as string) || '';
    }

    if (grantType !== 'authorization_code') {
      return NextResponse.json({ error: 'unsupported_grant_type' }, { status: 400 });
    }

    if (!clientId || !clientSecret || !code || !redirectUri) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }

    // 1. Verify app in mastodon_apps with secure timingSafeEqual client_secret comparison
    const { data: appRecord, error: appError } = await supabaseServer
      .from('mastodon_apps')
      .select('client_id, client_secret, redirect_uri, scope, scopes')
      .eq('client_id', clientId)
      .maybeSingle();

    if (appError || !appRecord || !appRecord.client_secret || !appRecord.redirect_uri) {
      return NextResponse.json({ error: 'invalid_client' }, { status: 400 });
    }

    let secretMatch = false;
    try {
      const bufA = Buffer.from(appRecord.client_secret);
      const bufB = Buffer.from(clientSecret);
      if (bufA.length === bufB.length) {
        secretMatch = crypto.timingSafeEqual(bufA, bufB);
      }
    } catch {
      secretMatch = false;
    }

    if (!secretMatch || appRecord.redirect_uri !== redirectUri) {
      return NextResponse.json({ error: 'invalid_client' }, { status: 400 });
    }

    // 2. Atomic DELETE ... RETURNING on oauth_codes validating code, client_id, expires_at > now, and redirect_uri (nullable fallback support)
    // Lines 63-71: Single atomic operation preventing race conditions for concurrent requests.
    const nowIso = new Date().toISOString();
    const { data: deletedCodes, error: deleteError } = await supabaseServer
      .from('oauth_codes')
      .delete()
      .eq('code', code)
      .eq('client_id', clientId)
      .or(`redirect_uri.eq.${redirectUri},redirect_uri.is.null`)
      .gt('expires_at', nowIso)
      .select('id, user_id, client_id, redirect_uri, scope, expires_at');

    if (deleteError || !deletedCodes || deletedCodes.length === 0) {
      return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
    }

    const codeRecord = deletedCodes[0];

    // 3. Strict scope intersection & allowlist validation
    const validScopes = ['read', 'write', 'follow', 'read write', 'read write follow', 'write follow', 'read follow'];
    const requestedScope = codeRecord.scope || 'read';
    const appScopes = appRecord.scopes || appRecord.scope || 'read write follow';

    const reqTokens = requestedScope.split(/\s+/).filter(Boolean);
    const appTokens = appScopes.split(/\s+/).filter(Boolean);
    const intersectionTokens = reqTokens.filter((t: string) => appTokens.includes(t));
    const finalScope = intersectionTokens.length > 0 ? intersectionTokens.join(' ') : 'read';

    if (!validScopes.includes(finalScope)) {
      return NextResponse.json({ error: 'invalid_scope' }, { status: 400 });
    }

    // 4. Generate signed stateless access token
    const now = Date.now();
    const maxDuration = 30 * 24 * 60 * 60 * 1000;
    const expiresAt = now + maxDuration;

    const tokenPayload = {
      userId: codeRecord.user_id,
      clientId: clientId,
      createdAt: now,
      expiresAt: expiresAt,
      scope: finalScope
    };

    const payloadJson = JSON.stringify(tokenPayload);
    const payloadB64 = Buffer.from(payloadJson).toString('base64url');
    const secret = process.env.MASTODON_TOKEN_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'server_error' }, { status: 500 });
    }
    const signatureB64 = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');

    const accessToken = `ef_token_${payloadB64}.${signatureB64}`;

    const tokenResponse = {
      access_token: accessToken,
      token_type: 'Bearer',
      scope: finalScope,
      created_at: Math.floor(now / 1000)
    };

    return new NextResponse(JSON.stringify(tokenResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch {
    // Fail closed without exposing raw errors, tokens, or secrets
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

