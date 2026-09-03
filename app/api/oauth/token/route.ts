import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { verifyClientSecret, generateAccessToken } from '@/lib/oauth/crypto';

export const dynamic = 'force-dynamic';

/**
 * Handle CORS Preflight for OAuth Token endpoint
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * POST /api/oauth/token
 * RFC 6749 standard Authorization Code Exchange.
 * Validates client credentials, single-use auth code, and issues a signed JWT access_token.
 */
export async function POST(req: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    Pragma: 'no-cache',
  };

  try {
    let clientId = '';
    let clientSecret = '';
    let grantType = '';
    let code = '';
    let redirectUri = '';

    // Support both application/json and application/x-www-form-urlencoded
    const contentType = req.headers.get('content-type') || '';

    // Also support Basic Auth header (client_id:client_secret) standard in OAuth 2.0
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader.startsWith('Basic ')) {
      try {
        const credentials = Buffer.from(authHeader.substring(6).trim(), 'base64').toString('utf8');
        const [basicId, basicSecret] = credentials.split(':');
        if (basicId) clientId = basicId;
        if (basicSecret) clientSecret = basicSecret;
      } catch {
        // Fallback to body
      }
    }

    if (contentType.includes('application/json')) {
      try {
        const body = await req.json();
        clientId = clientId || body?.client_id || '';
        clientSecret = clientSecret || body?.client_secret || '';
        grantType = body?.grant_type || '';
        code = body?.code || '';
        redirectUri = body?.redirect_uri || '';
      } catch {
        // Invalid or empty JSON
      }
    } else {
      try {
        const formData = await req.formData();
        clientId = clientId || (formData.get('client_id') as string) || '';
        clientSecret = clientSecret || (formData.get('client_secret') as string) || '';
        grantType = (formData.get('grant_type') as string) || '';
        code = (formData.get('code') as string) || '';
        redirectUri = (formData.get('redirect_uri') as string) || '';
      } catch {
        // Could not parse formData, try urlencoded text
        try {
          const rawText = await req.text();
          const params = new URLSearchParams(rawText);
          clientId = clientId || params.get('client_id') || '';
          clientSecret = clientSecret || params.get('client_secret') || '';
          grantType = grantType || params.get('grant_type') || '';
          code = code || params.get('code') || '';
          redirectUri = redirectUri || params.get('redirect_uri') || '';
        } catch {
          // Ignored
        }
      }
    }

    // 1. Grant type doğrulama
    if (grantType !== 'authorization_code') {
      return NextResponse.json(
        { error: 'unsupported_grant_type', error_description: 'grant_type must be authorization_code.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 2. Zorunlu alan kontrolü
    if (!clientId || !clientSecret || !code || !redirectUri) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'client_id, client_secret, code, and redirect_uri are required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. İstemci (Client) ve Şifre (Secret) Doğrulaması
    let clientRecord: { client_id: string; client_secret: string; redirect_uris: string[] } | null = null;

    const { data: dbClient, error: clientErr } = await supabaseServer
      .from('oauth_clients')
      .select('client_id, client_secret, redirect_uris')
      .eq('client_id', clientId)
      .maybeSingle();

    if (!clientErr && dbClient) {
      clientRecord = {
        client_id: dbClient.client_id,
        client_secret: dbClient.client_secret,
        redirect_uris: Array.isArray(dbClient.redirect_uris) ? dbClient.redirect_uris : [dbClient.redirect_uris],
      };
    } else {
      // Legacy mastodon_apps fallback
      const { data: legacyApp } = await supabaseServer
        .from('mastodon_apps')
        .select('client_id, client_secret, redirect_uri')
        .eq('client_id', clientId)
        .maybeSingle();

      if (legacyApp) {
        clientRecord = {
          client_id: legacyApp.client_id,
          client_secret: legacyApp.client_secret,
          redirect_uris: [legacyApp.redirect_uri],
        };
      }
    }

    if (!clientRecord) {
      return NextResponse.json(
        { error: 'invalid_client', error_description: 'Client authentication failed (unknown client_id).' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Timing-attack korumalı client_secret doğrulaması
    const isSecretValid = verifyClientSecret(clientSecret, clientRecord.client_secret);
    if (!isSecretValid) {
      return NextResponse.json(
        { error: 'invalid_client', error_description: 'Client authentication failed (invalid client_secret).' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Redirect URI eşleşmesi
    const uriMatched = clientRecord.redirect_uris.some((uri) => uri === redirectUri || (uri.includes('urn:ietf:wg:oauth:2.0:oob') && redirectUri.includes('urn:ietf:wg:oauth:2.0:oob')));
    if (!uriMatched) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'redirect_uri does not match client configuration.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 4. Yetkilendirme Kodu (Code) Doğrulaması & Tek Kullanımlık (One-Time) Atomik İşlem
    const nowIso = new Date().toISOString();

    // Yarış koşullarına (race condition) karşı atomik UPDATE: used = false iken true yapılır
    const { data: updatedCodes, error: updateErr } = await supabaseServer
      .from('oauth_codes')
      .update({ used: true })
      .eq('code', code)
      .eq('client_id', clientId)
      .eq('used', false)
      .gt('expires_at', nowIso)
      .select('code, client_id, user_id, redirect_uri, scope, expires_at');

    if (updateErr || !updatedCodes || updatedCodes.length === 0) {
      // Kod bulunamadı, süresi doldu veya daha önce kullanıldı!
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Authorization code is invalid, expired, or has already been used.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const codeRecord = updatedCodes[0];

    // İstemci kod oluşturulurken kullanılan redirect_uri ile aynı olmalıdır
    if (codeRecord.redirect_uri && codeRecord.redirect_uri !== redirectUri) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'redirect_uri does not match the original authorization request.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 5. JWT Access Token Üretimi (Varsayılan 1 saat / 3600 sn)
    const tokenScope = codeRecord.scope || 'read';
    const expiresInSeconds = 3600;
    const tokenData = generateAccessToken(codeRecord.user_id, clientId, tokenScope, expiresInSeconds);

    // 6. Token'ı Veritabanında Kaydet (Denetim, iptal ve oturum takibi için)
    const tokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
    await supabaseServer
      .from('oauth_tokens')
      .insert({
        access_token: tokenData.access_token,
        client_id: clientId,
        user_id: codeRecord.user_id,
        scope: tokenScope,
        expires_at: tokenExpiresAt,
      })
      .select('id')
      .maybeSingle();

    // 7. Standart OAuth 2.0 JSON Yanıtı
    return new NextResponse(
      JSON.stringify({
        access_token: tokenData.access_token,
        token_type: 'Bearer',
        expires_in: expiresInSeconds,
        scope: tokenScope,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[OAuth Token] Unexpected server error:', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'An internal error occurred while generating token.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
