import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

function isValidRedirectUri(uri: string): boolean {
  try {
    const trimmed = uri.trim();
    if (!trimmed) return false;
    if (trimmed === 'urn:ietf:wg:oauth:2.0:oob') return true;

    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:') return true;
    if (parsed.protocol === 'http:' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '[::1]')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * PUT /api/developer/apps/[id]
 * Updates an OAuth application's metadata and redirect URIs.
 * Strictly checks that owner_id matches authenticated user.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Yetkisiz erişim.' },
        { status: 401 }
      );
    }

    const { id: clientId } = await params;
    if (!clientId) {
      return NextResponse.json({ error: 'invalid_id', message: 'Client ID gereklidir.' }, { status: 400 });
    }

    // Uygulama var mı ve bu kullanıcıya mı ait?
    const { data: existingApp, error: findError } = await supabaseServer
      .from('oauth_clients')
      .select('client_id, owner_id')
      .eq('client_id', clientId)
      .eq('owner_id', user.id)
      .maybeSingle();

    if (findError || !existingApp) {
      return NextResponse.json(
        { error: 'not_found', message: 'Uygulama bulunamadı veya bu işlem için yetkiniz yok.' },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const clientName = typeof body?.client_name === 'string' ? body.client_name.trim() : undefined;
    const description = typeof body?.description === 'string' ? body.description.trim() : undefined;
    const logoUrl = typeof body?.logo_url === 'string' ? body.logo_url.trim() : undefined;
    const rawRedirectUris = body?.redirect_uris;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (clientName !== undefined) {
      if (clientName.length < 2 || clientName.length > 80) {
        return NextResponse.json(
          { error: 'invalid_name', message: 'Uygulama adı 2 ile 80 karakter arasında olmalıdır.' },
          { status: 400 }
        );
      }
      updates.client_name = clientName;
    }

    if (rawRedirectUris !== undefined) {
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
          { error: 'invalid_redirect_uris', message: 'En az bir adet geçerli Yönlendirme Adresi girmelisiniz.' },
          { status: 400 }
        );
      }

      for (const uri of uris) {
        if (!isValidRedirectUri(uri)) {
          return NextResponse.json(
            { error: 'invalid_uri_format', message: `Geçersiz URI: "${uri}".` },
            { status: 400 }
          );
        }
      }

      updates.redirect_uris = uris;
    }

    if (description !== undefined) {
      updates.description = description || null;
    }

    if (logoUrl !== undefined) {
      if (logoUrl) {
        try {
          const parsed = new URL(logoUrl);
          if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
            return NextResponse.json({ error: 'invalid_logo_url', message: 'Logo geçerli bir web URL olmalıdır.' }, { status: 400 });
          }
        } catch {
          return NextResponse.json({ error: 'invalid_logo_url', message: 'Logo geçerli bir URL biçiminde olmalıdır.' }, { status: 400 });
        }
      }
      updates.logo_url = logoUrl || null;
    }

    const { data: updatedApp, error: updateError } = await supabaseServer
      .from('oauth_clients')
      .update(updates)
      .eq('client_id', clientId)
      .eq('owner_id', user.id)
      .select('client_id, client_name, redirect_uris, description, logo_url, updated_at')
      .single();

    if (updateError) {
      console.error('[Developer API] Update app error:', updateError);
      return NextResponse.json(
        { error: 'update_failed', message: 'Uygulama güncellenirken bir hata oluştu.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Uygulama başarıyla güncellendi.',
      app: updatedApp,
    });
  } catch (error) {
    console.error('[Developer API] Unexpected error in PUT:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Uygulama güncellenirken bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/developer/apps/[id]
 * Deletes an OAuth application owned by the user.
 * Revokes all associated tokens and codes.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Yetkisiz erişim.' },
        { status: 401 }
      );
    }

    const { id: clientId } = await params;
    if (!clientId) {
      return NextResponse.json({ error: 'invalid_id', message: 'Client ID gereklidir.' }, { status: 400 });
    }

    // Doğrulama ve silme
    const { data: existingApp } = await supabaseServer
      .from('oauth_clients')
      .select('client_id, owner_id')
      .eq('client_id', clientId)
      .eq('owner_id', user.id)
      .maybeSingle();

    if (!existingApp) {
      return NextResponse.json(
        { error: 'not_found', message: 'Uygulama bulunamadı veya bu işlem için yetkiniz yok.' },
        { status: 404 }
      );
    }

    // 1. İlişkili tokenları ve kodları temizle (İptal)
    await supabaseServer.from('oauth_tokens').delete().eq('client_id', clientId);
    await supabaseServer.from('oauth_codes').delete().eq('client_id', clientId);

    // 2. Uygulamayı sil
    const { error: deleteError } = await supabaseServer
      .from('oauth_clients')
      .delete()
      .eq('client_id', clientId)
      .eq('owner_id', user.id);

    if (deleteError) {
      console.error('[Developer API] Delete app error:', deleteError);
      return NextResponse.json(
        { error: 'delete_failed', message: 'Uygulama silinirken hata oluştu.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Uygulama ve bağlı tüm yetkilendirmeler başarıyla silindi.',
    });
  } catch (error) {
    console.error('[Developer API] Unexpected error in DELETE:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Uygulama silinirken bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
