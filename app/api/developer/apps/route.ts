import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseServer } from '@/lib/supabase-server';
import { generateClientId, generateClientSecret, hashClientSecret } from '@/lib/oauth/crypto';

export const dynamic = 'force-dynamic';

/**
 * Validates whether a redirect URI is structurally valid and secure.
 * Disallows javascript:, data:, and insecure non-localhost http:
 */
function isValidRedirectUri(uri: string): boolean {
  try {
    const trimmed = uri.trim();
    if (!trimmed) return false;
    if (trimmed === 'urn:ietf:wg:oauth:2.0:oob') return true;

    const parsed = new URL(trimmed);
    // Allow HTTPS always
    if (parsed.protocol === 'https:') return true;
    // Allow HTTP only for local development
    if (parsed.protocol === 'http:' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '[::1]')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * GET /api/developer/apps
 * Lists all OAuth applications owned by the currently authenticated developer.
 * Strict Isolation: Never returns applications of other users or any admin data.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Geliştirici portalına erişmek için giriş yapmalısınız.' },
        { status: 401 }
      );
    }

    // Yalnızca oturum açmış kullanıcının sahip olduğu uygulamaları getir
    const { data: apps, error: dbError } = await supabaseServer
      .from('oauth_clients')
      .select('client_id, client_name, redirect_uris, description, logo_url, created_at, updated_at')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('[Developer API] Fetch apps error:', dbError);
      return NextResponse.json(
        { 
          error: 'database_error', 
          message: 'Uygulamalar listelenirken bir hata oluştu.',
          details: dbError.message,
          hint: 'Supabase SQL Editöründe supabase_oauth_schema.sql kodunu çalıştırarak oauth_clients tablosunu ve izinlerini güncelleyebilirsiniz.'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      apps: apps || [],
      total: (apps || []).length,
    });
  } catch (error) {
    console.error('[Developer API] Unexpected error in GET:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/developer/apps
 * Creates a new OAuth application for the authenticated developer.
 * Generates client_id and plain client_secret, stores salted hash, and
 * returns the plain client_secret ONLY ONCE.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Uygulama oluşturmak için giriş yapmalısınız.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const clientName = typeof body?.client_name === 'string' ? body.client_name.trim() : '';
    const description = typeof body?.description === 'string' ? body.description.trim() : '';
    const logoUrl = typeof body?.logo_url === 'string' ? body.logo_url.trim() : '';
    const rawRedirectUris = body?.redirect_uris;

    // 1. İsim Doğrulama
    if (!clientName || clientName.length < 2 || clientName.length > 80) {
      return NextResponse.json(
        { error: 'invalid_name', message: 'Uygulama adı 2 ile 80 karakter arasında olmalıdır.' },
        { status: 400 }
      );
    }

    // 2. Redirect URIs Doğrulama
    let uris: string[] = [];
    if (Array.isArray(rawRedirectUris)) {
      uris = rawRedirectUris.map((u) => String(u).trim()).filter(Boolean);
    } else if (typeof rawRedirectUris === 'string') {
      uris = rawRedirectUris
        .split(/[\n,]+/)
        .map((u) => u.trim())
        .filter(Boolean);
    }

    if (uris.length === 0) {
      return NextResponse.json(
        { error: 'invalid_redirect_uris', message: 'En az bir adet geçerli Yönlendirme Adresi (Redirect URI) girmelisiniz.' },
        { status: 400 }
      );
    }

    if (uris.length > 10) {
      return NextResponse.json(
        { error: 'too_many_uris', message: 'En fazla 10 adet yönlendirme adresi ekleyebilirsiniz.' },
        { status: 400 }
      );
    }

    for (const uri of uris) {
      if (!isValidRedirectUri(uri)) {
        return NextResponse.json(
          {
            error: 'invalid_uri_format',
            message: `Geçersiz veya güvensiz URI: "${uri}". Sadece HTTPS, localhost/127.0.0.1 veya urn:ietf:wg:oauth:2.0:oob kabul edilir.`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Logo URL Doğrulama
    if (logoUrl) {
      try {
        const parsed = new URL(logoUrl);
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
          return NextResponse.json(
            { error: 'invalid_logo_url', message: 'Logo URL geçerli bir web bağlantısı olmalıdır.' },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'invalid_logo_url', message: 'Logo URL geçerli bir URL biçiminde olmalıdır.' },
          { status: 400 }
        );
      }
    }

    // 4. Kriptografik Anahtarlar Üretimi
    const clientId = generateClientId();
    const plainSecret = generateClientSecret();
    const hashedSecret = hashClientSecret(plainSecret);

    // 5. Veritabanına Güvenli Kayıt
    const { data: newApp, error: insertError } = await supabaseServer
      .from('oauth_clients')
      .insert({
        client_id: clientId,
        client_secret: hashedSecret,
        client_name: clientName,
        redirect_uris: uris,
        description: description || null,
        logo_url: logoUrl || null,
        owner_id: user.id,
        is_trusted: false,
      })
      .select('client_id, client_name, redirect_uris, description, logo_url, created_at')
      .single();

    if (insertError) {
      console.error('[Developer API] Insert app error:', insertError);
      return NextResponse.json(
        { error: 'insert_failed', message: 'Uygulama oluşturulamadı. Lütfen veritabanı şemasını kontrol edin.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Uygulamanız başarıyla oluşturuldu.',
        app: newApp,
        // DİKKAT: plain_client_secret sadece ve sadece bu yanıtta döner!
        plain_client_secret: plainSecret,
        warning: 'Gizli anahtarınızı (Client Secret) lütfen şimdi kopyalayın. Güvenlik gereği veritabanında tuzlanmış (salted hash) olarak saklanır ve bir daha asla görüntülenemez.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Developer API] Unexpected error in POST:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Uygulama oluşturulurken bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
