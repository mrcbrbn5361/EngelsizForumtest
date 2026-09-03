import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { verifyAccessToken } from '@/lib/oauth/crypto';

export const dynamic = 'force-dynamic';

/**
 * Handle CORS Preflight for UserInfo endpoint
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * GET /api/oauth/userinfo
 * OpenID Connect / OAuth 2.0 UserInfo Endpoint.
 * Validates Bearer token and returns authenticated user's profile and email.
 */
export async function GET(req: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    Pragma: 'no-cache',
  };

  try {
    // 1. Authorization: Bearer <token> başlığını al
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return NextResponse.json(
        { error: 'invalid_token', error_description: 'Missing or malformed Authorization header. Expected: Bearer <token>' },
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'WWW-Authenticate': 'Bearer error="invalid_token", error_description="Missing Bearer token"',
          },
        }
      );
    }

    const token = authHeader.substring(7).trim();

    // 2. Token İmza ve Süre Kontrolü (JWT HS256)
    const verification = verifyAccessToken(token);
    if (!verification.valid || !verification.payload) {
      return NextResponse.json(
        { error: 'invalid_token', error_description: verification.error || 'The access token is invalid or has expired.' },
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'WWW-Authenticate': `Bearer error="invalid_token", error_description="${verification.error}"`,
          },
        }
      );
    }

    const userId = verification.payload.sub;

    // 3. Veritabanından İptal Kontrolü (Token Revocation Check)
    const { data: tokenRecord } = await supabaseServer
      .from('oauth_tokens')
      .select('revoked')
      .eq('access_token', token)
      .maybeSingle();

    if (tokenRecord?.revoked) {
      return NextResponse.json(
        { error: 'invalid_token', error_description: 'This access token has been revoked.' },
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'WWW-Authenticate': 'Bearer error="invalid_token", error_description="Token revoked"',
          },
        }
      );
    }

    // 4. Kullanıcı Verilerini Çek (auth.users ve public.profiles)
    let email: string | null = null;
    try {
      const { data: authUserData } = await supabaseServer.auth.admin.getUserById(userId);
      if (authUserData?.user?.email) {
        email = authUserData.user.email;
      }
    } catch {
      // Ignored if service role admin access isn't available
    }

    const { data: profile } = await supabaseServer
      .from('profiles')
      .select('id, username, full_name, display_name, avatar_url, role, bio, level, reputation_points')
      .eq('id', userId)
      .maybeSingle();

    const username = profile?.username || email?.split('@')[0] || 'kullanici';
    const fullName = profile?.full_name || profile?.display_name || username;

    // 5. Standart OIDC / OAuth UserInfo JSON Yanıtı
    const userInfo = {
      sub: userId,
      id: userId,
      username: username,
      email: email,
      email_verified: Boolean(email),
      name: fullName,
      preferred_username: username,
      picture: profile?.avatar_url || null,
      role: profile?.role || 'user',
      level: profile?.level || 1,
      reputation: profile?.reputation_points || 0,
      client_id: verification.payload.client_id,
      scope: verification.payload.scope,
    };

    return new NextResponse(JSON.stringify(userInfo), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('[OAuth UserInfo] Unexpected error:', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'An error occurred while fetching user profile.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
