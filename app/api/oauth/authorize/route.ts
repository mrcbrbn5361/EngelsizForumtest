import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/oauth/authorize
 * Validates OAuth 2.0 request parameters and routes to login or user consent screen.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const clientId = (searchParams.get('client_id') || '').trim();
  const redirectUri = (searchParams.get('redirect_uri') || '').trim();
  const responseType = (searchParams.get('response_type') || '').trim();
  const state = (searchParams.get('state') || '').trim();
  const scope = (searchParams.get('scope') || 'read').trim();

  // 1. Parametre Varlık Kontrolleri
  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'client_id and redirect_uri are required parameters.' },
      { status: 400 }
    );
  }

  if (responseType !== 'code') {
    return NextResponse.json(
      { error: 'unsupported_response_type', error_description: 'Only response_type=code is supported (Authorization Code Flow).' },
      { status: 400 }
    );
  }

  // 2. İstemci (Client) ve Redirect URI Doğrulaması (Open-Redirect Koruması)
  let clientRecord: { client_id: string; client_name: string; redirect_uris: string[] } | null = null;

  try {
    const { data: appData, error: appError } = await supabaseServer
      .from('oauth_clients')
      .select('client_id, client_name, redirect_uris')
      .eq('client_id', clientId)
      .maybeSingle();

    if (!appError && appData) {
      clientRecord = {
        client_id: appData.client_id,
        client_name: appData.client_name,
        redirect_uris: Array.isArray(appData.redirect_uris) ? appData.redirect_uris : [appData.redirect_uris],
      };
    } else {
      // Geriye dönük uyumluluk: mastodon_apps tablosu fallback kontrolü
      const { data: legacyApp } = await supabaseServer
        .from('mastodon_apps')
        .select('client_id, name, redirect_uri')
        .eq('client_id', clientId)
        .maybeSingle();

      if (legacyApp) {
        clientRecord = {
          client_id: legacyApp.client_id,
          client_name: legacyApp.name,
          redirect_uris: [legacyApp.redirect_uri],
        };
      }
    }
  } catch (err) {
    console.error('[OAuth Authorize] Database error looking up client:', err);
  }

  if (!clientRecord) {
    return NextResponse.json(
      { error: 'invalid_client', error_description: 'Unknown or unregistered client_id.' },
      { status: 400 }
    );
  }

  // Güvenli URI Eşleşmesi: Kayıtlı olmayan redirect_uri'lere ASLA yönlendirme yapılmaz
  const isAllowedUri = clientRecord.redirect_uris.some((allowed) => {
    return allowed === redirectUri || (allowed.includes('urn:ietf:wg:oauth:2.0:oob') && redirectUri.includes('urn:ietf:wg:oauth:2.0:oob'));
  });

  if (!isAllowedUri) {
    return NextResponse.json(
      { error: 'invalid_redirect_uri', error_description: 'The requested redirect_uri does not match client registration.' },
      { status: 400 }
    );
  }

  // 3. Kullanıcı Oturum Kontrolü (Cookie tabanlı Supabase Auth)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const consentParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    scope: scope,
    state: state,
  });

  const consentUrl = `/oauth/authorize?${consentParams.toString()}`;

  if (!user) {
    // Oturum kapalı ise önce login'e gönder, girişten sonra onay ekranına dönsün
    const loginUrl = `/login?returnTo=${encodeURIComponent(consentUrl)}`;
    return NextResponse.redirect(new URL(loginUrl, req.url));
  }

  // Oturum açık ise onay/izin arayüzüne yönlendir
  return NextResponse.redirect(new URL(consentUrl, req.url));
}
