export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Shield, Check, X, Info } from 'lucide-react';
import { supabaseServer } from '@/lib/supabase-server';

interface PageProps {
  searchParams: Promise<{
    client_id?: string;
    redirect_uri?: string;
    response_type?: string;
    scope?: string;
    state?: string;
  }>;
}

export default async function OAuthAuthorizePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    const searchParamsString = new URLSearchParams(params as Record<string, string>).toString();
    redirect(`/login?returnTo=${encodeURIComponent(`/oauth/authorize?${searchParamsString}`)}`);
  }

  if (!params.client_id) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="vibe-card p-8 border-destructive max-w-md w-full text-center">
          <X className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Hatalı İstek</h1>
          <p className="text-muted-foreground">client_id bulunamadı.</p>
        </div>
      </main>
    );
  }

  // Fetch app info
  const { data: appData } = await supabaseServer
    .from('mastodon_apps')
    .select('name, website')
    .eq('client_id', params.client_id)
    .single();

  const appInfo = appData || { name: 'Harici Uygulama' };

  async function handleAppAction(formData: FormData) {
    'use server';
    const action = formData.get('action');
    const redirect_uri = formData.get('redirect_uri') as string;
    const client_id = formData.get('client_id') as string;
    const scope = formData.get('scope') as string;
    const state = formData.get('state') as string;
    const userId = formData.get('user_id') as string;

    if (action === 'deny') {
        const redirectUrl = new URL(redirect_uri);
        redirectUrl.searchParams.set('error', 'access_denied');
        if (state) redirectUrl.searchParams.set('state', state);
        redirect(redirectUrl.toString());
    } else if (action === 'approve') {
        const supabase = await createClient();
        const code = crypto.randomUUID();
        
        await supabase
            .from('oauth_codes')
            .insert({
              code,
              user_id: userId,
              client_id: client_id,
              scope: scope,
              expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
            });

        const redirectUrl = new URL(redirect_uri);
        redirectUrl.searchParams.set('code', code);
        if (state) redirectUrl.searchParams.set('state', state);
        redirect(redirectUrl.toString());
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="vibe-card p-0 overflow-hidden border-2 border-border max-w-lg w-full shadow-2xl rounded-[2.5rem]">
        <div className="bg-primary/5 p-8 sm:p-12 text-center border-b border-border">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Erişim Onayı</h1>
          <p className="text-muted-foreground font-medium">Uygulama Yetkilendirme İsteği</p>
        </div>

        <form action={handleAppAction} className="p-8 sm:p-12 space-y-8">
          <input type="hidden" name="redirect_uri" value={params.redirect_uri} />
          <input type="hidden" name="client_id" value={params.client_id} />
          <input type="hidden" name="scope" value={params.scope || ''} />
          <input type="hidden" name="state" value={params.state || ''} />
          <input type="hidden" name="user_id" value={user.id} />

          <section className="text-center">
            <h2 className="text-lg sm:text-xl font-bold leading-relaxed mb-4">
              <span className="text-primary">{appInfo.name}</span> uygulaması, 
              <br />
              <span className="font-black text-foreground">Engelsiz Forum</span> hesabınıza erişmek istiyor.
            </h2>
            <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-2xl flex items-center gap-3 justify-center text-left">
              <Info size={16} className="text-primary flex-shrink-0" />
              <span>Bu işlem sonucunda uygulama sizin adınıza işlem yapabilir, gönderilerinizi görebilir.</span>
            </div>
          </section>

          <section>
            <h3 className="vibe-label mb-4">TALEP EDİLEN İZİNLER</h3>
            <ul className="space-y-3">
              {(params.scope?.split(' ') || ['read']).map((s) => (
                <li key={s} className="flex items-center gap-3 text-sm font-medium p-3 bg-card border border-border rounded-xl">
                  <div className="size-5 bg-primary/20 rounded-full flex items-center justify-center">
                    <Check size={12} className="text-primary" />
                  </div>
                  <span className="uppercase tracking-wider opacity-80">{s}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              name="action"
              value="deny"
              type="submit"
              className="vibe-button-secondary py-4 flex items-center justify-center gap-2 group"
            >
              <X size={20} />
              <span className="font-bold">REDDET</span>
            </button>
            <button
              name="action"
              value="approve"
              type="submit"
              className="vibe-button py-4 flex items-center justify-center gap-2 group"
            >
              <Check size={20} />
              <span className="font-bold">ONAYLA</span>
            </button>
          </div>
        </form>

        <footer className="p-6 bg-muted/30 text-center border-t border-border">
          <p className="text-xs text-muted-foreground">
            Giriş yapan kullanıcı: <span className="font-bold text-foreground">{user.email}</span>
          </p>
        </footer>
      </div>
    </main>
  );
}
