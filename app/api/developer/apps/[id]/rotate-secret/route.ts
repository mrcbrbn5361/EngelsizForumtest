import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseServer } from '@/lib/supabase-server';
import { generateClientSecret, hashClientSecret } from '@/lib/oauth/crypto';

export const dynamic = 'force-dynamic';

/**
 * POST /api/developer/apps/[id]/rotate-secret
 * Generates a brand new client_secret for the application.
 * Immediately invalidates the previous secret.
 * The new secret is returned only once to the developer.
 */
export async function POST(
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
    const { data: app, error: findError } = await supabaseServer
      .from('oauth_clients')
      .select('client_id, client_name, owner_id')
      .eq('client_id', clientId)
      .eq('owner_id', user.id)
      .maybeSingle();

    if (findError || !app) {
      return NextResponse.json(
        { error: 'not_found', message: 'Uygulama bulunamadı veya bu işlem için yetkiniz yok.' },
        { status: 404 }
      );
    }

    // Yeni gizli anahtar üret ve hash'le
    const newPlainSecret = generateClientSecret();
    const newHashedSecret = hashClientSecret(newPlainSecret);

    const { error: updateError } = await supabaseServer
      .from('oauth_clients')
      .update({
        client_secret: newHashedSecret,
        updated_at: new Date().toISOString(),
      })
      .eq('client_id', clientId)
      .eq('owner_id', user.id);

    if (updateError) {
      console.error('[Developer API] Rotate secret error:', updateError);
      return NextResponse.json(
        { error: 'update_failed', message: 'Yeni anahtar oluşturulurken bir hata oluştu.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Uygulama gizli anahtarı (Client Secret) başarıyla yenilendi.',
      plain_client_secret: newPlainSecret,
      warning: 'Yeni gizli anahtarınızı lütfen hemen kopyalayın. Eski anahtarınız artık çalışmayacaktır. Bu anahtar bir daha ekranda gösterilmeyecektir.',
    });
  } catch (error) {
    console.error('[Developer API] Unexpected error in rotate-secret:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
