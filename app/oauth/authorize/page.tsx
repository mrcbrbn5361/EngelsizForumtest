// app/oauth/authorize/page.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server'; // Prorendeki hazır sunucu istemciniz
import { Shield, Check, X, Info } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OAuthAuthorizePage({ searchParams }: PageProps) {
  // 1. URL parametrelerini sunucu tarafında güvenle çözüyoruz
  const resolvedParams = await searchParams;
  const clientId = (resolvedParams.client_id as string) || '';
  const redirectUri = (resolvedParams.redirect_uri as string) || '';
  const scope = (resolvedParams.scope as string) || 'read';
  const state = (resolvedParams.state as string) || '';

  // 2. Kullanıcı oturumunu sunucuda kontrol ediyoruz
  const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

  if (authError || !user) {
    // Oturum yoksa, parametreleri kaybetmeden login sayfasına yönlendiriyoruz
    const loginParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope,
      state: state
    });
    redirect(`/login?returnTo=${encodeURIComponent(`/oauth/authorize?${loginParams.toString()}`)}`);
  }

  // 3. İstemci (Uygulama) doğrulama
  let appName = 'Harici Uygulama';
  if (clientId) {
    const { data: appData } = await supabaseServer
      .from('mastodon_apps')
      .select('name')
      .eq('client_id', clientId)
      .maybeSingle();
    if (appData?.name) appName = appData.name;
  }

  // 4. Form Onaylandığında Çalışacak Sunucu Aksiyonu (Server Action)
  async function handleOAuthForm(formData: FormData) {
    'use server';
    
    const action = formData.get('action');
    const targetRedirect = formData.get('redirect_uri') as string;
    const currentClientId = formData.get('client_id') as string;
    const currentScope = formData.get('scope') as string;
    const currentState = formData.get('state') as string;

    if (action === 'deny') {
      if (!targetRedirect || targetRedirect.includes('urn:ietf:wg:oauth:2.0:oob')) {
        redirect('/?error=access_denied');
      }
      redirect(`${targetRedirect}${targetRedirect.includes('?') ? '&' : '?'}error=access_denied&state=${currentState}`);
    }

    // Onaylandı: Rastgele güvenli kod üretimi (Sunucu tarafında crypto güvenlidir)
    const code = crypto.randomUUID();

    // Kodu veritabanına kaydedelim
    await supabaseServer
      .from('oauth_codes')
      .insert({
        code,
        user_id: user?.id,
        client_id: currentClientId,
        scope: currentScope,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });

    // Eğer Out-of-Band (OOB) modu ise uygulamaya yönlendirmek yerine kodu ekranda göstermeliyiz!
    if (!targetRedirect || targetRedirect.includes('urn:ietf:wg:oauth:2.0:oob')) {
      redirect(`/oauth/authorize?show_oob_code=${code}`);
    }

    // Normal uygulama veya Deep-link yönlendirmesi (String birleştirme ile çökme riski sıfır)
    const separator = targetRedirect.includes('?') ? '&' : '?';
    redirect(`${targetRedirect}${separator}code=${code}&state=${currentState}`);
  }

  // 5. Eğer Out-of-band kodu üretildiyse kullanıcıya temiz bir kopyalama ekranı sunalım
  const oobCode = resolvedParams.show_oob_code as string;
  if (oobCode) {
    return (
      <div className="min-h-screen bg-[#fcf8fb] flex items-center justify-center p-4" style={{ fontFamily: 'sans-serif' }}>
        <div className="bg-white border-2 border-[#bdc9c6] rounded-[2.5rem] p-8 max-w-md w-full text-center shadow-xl">
          <Check className="w-16 h-16 text-[#005c55] mx-auto mb-4 stroke-[3]" />
          <h1 className="text-2xl font-black mb-2 text-[#1c1b1d]">Yetkilendirme Başarılı!</h1>
          <p className="text-sm text-[#3e4947] mb-6 font-semibold uppercase">Lütfen aşağıdaki kodu kopyalayıp uygulamanıza yapıştırın:</p>
          <div className="bg-[#f0edf0] p-4 rounded-xl font-mono text-xs border border-[#bdc9c6] break-all select-all font-bold text-[#005c55]">
            {oobCode}
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 font-bold">EngelsizForum Güvenli Bağlantı Sistemi</p>
        </div>
      </div>
    );
  }

  // 6. Standart Onay Arayüzü (Saf HTML Form elemanları ile çalışır, Client JS gerektirmez)
  return (
    <div className="min-h-screen bg-[#fcf8fb] flex items-center justify-center p-4 w-full" style={{ fontFamily: 'sans-serif' }}>
      <div className="bg-white border-2 border-[#bdc9c6] rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="bg-[#005c55]/5 p-8 text-center border-b border-[#bdc9c6]">
          <div className="bg-[#005c55]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-[#005c55]" />
          </div>
          <h1 className="text-2xl font-black text-[#1c1b1d]">Erişim Onayı</h1>
          <p className="text-xs text-[#3e4947] font-bold uppercase tracking-wider mt-1">Uygulama Yetkilendirme İşlemi</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-base sm:text-lg font-bold leading-relaxed text-[#1c1b1d]">
              <span className="text-[#005c55] font-black">{appName}</span> uygulaması <br />
              <span className="font-black">EngelsizForum</span> hesabınıza erişmek istiyor.
            </h2>
          </div>

          <div className="text-xs text-[#3e4947] bg-[#f0edf0] p-4 rounded-2xl flex items-center gap-3 text-left border border-[#bdc9c6]/60 font-semibold">
            <Info size={18} className="text-[#005c55] shrink-0" />
            <span>Bu işlem sonucunda uygulama sizin adınıza profilinizi görebilir ve yeni başlıklar açabilir.</span>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#3e4947] block ml-1">Talep Edilen İzinler</span>
            <div className="p-3 bg-white border border-[#bdc9c6] rounded-xl text-xs font-bold text-[#005c55] uppercase tracking-wider">
               🔑 {scope}
            </div>
          </div>

          {/* Form verileri tetiklendiğinde doğrudan sunucu aksiyonu devreye girer */}
          <form action={handleOAuthForm} className="grid grid-cols-2 gap-4 pt-2">
            <input type="hidden" name="client_id" value={clientId} />
            <input type="hidden" name="redirect_uri" value={redirectUri} />
            <input type="hidden" name="scope" value={scope} />
            <input type="hidden" name="state" value={state} />

            <button
              type="submit"
              name="action"
              value="deny"
              className="h-12 bg-[#f0edf0] hover:bg-[#bdc9c6]/40 text-[#1c1b1d] font-black text-xs uppercase tracking-widest rounded-xl border border-[#bdc9c6] transition-all cursor-pointer"
            >
              REDDET
            </button>
            <button
              type="submit"
              name="action"
              value="allow"
              className="h-12 bg-[#005c55] hover:brightness-110 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md shadow-[#005c55]/10"
            >
              ONAYLA
            </button>
          </form>
        </div>

        <footer className="p-4 bg-[#f0edf0]/50 text-center border-t border-[#bdc9c6]">
          <p className="text-[10px] text-[#3e4947] font-bold">
            Giriş Yapan Hesap: <span className="text-[#1c1b1d]">{user?.email}</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
