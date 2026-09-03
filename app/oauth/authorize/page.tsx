// app/oauth/authorize/page.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseServer as adminSupabase } from '@/lib/supabase-server';
import { generateAuthorizationCode } from '@/lib/oauth/crypto';
import { Shield, Check, X, Info, AlertTriangle, ExternalLink } from 'lucide-react';
import { EngelsizForumLogo } from '@/components/ui/engelsizforum-brand';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OAuthAuthorizePage({ searchParams }: PageProps) {
  // 1. URL parametrelerini sunucu tarafında güvenle çözüyoruz
  const resolvedParams = await searchParams;
  const clientId = ((resolvedParams.client_id as string) || '').trim();
  const redirectUri = ((resolvedParams.redirect_uri as string) || '').trim();
  const scope = ((resolvedParams.scope as string) || 'read').trim();
  const state = ((resolvedParams.state as string) || '').trim();

  // 2. Zorunlu Parametre Doğrulaması
  if (!clientId || !redirectUri) {
    return (
      <div className="min-h-screen bg-[#fcf8fb] flex items-center justify-center p-4" style={{ fontFamily: 'sans-serif' }}>
        <div className="bg-white border-2 border-rose-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <AlertTriangle className="w-16 h-16 text-rose-600 mx-auto mb-4" />
          <h1 className="text-xl font-black mb-2 text-slate-800">Eksik OAuth Parametreleri</h1>
          <p className="text-sm text-slate-600 mb-6">
            Yetkilendirme isteğinde <code className="bg-slate-100 px-2 py-0.5 rounded text-rose-600 font-mono">client_id</code> ve <code className="bg-slate-100 px-2 py-0.5 rounded text-rose-600 font-mono">redirect_uri</code> parametreleri zorunludur.
          </p>
          <a href="/" className="inline-block px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider">
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    );
  }

  // 3. İstemci (Client) Doğrulama & Open-Redirect Koruması
  let appName = 'Harici Uygulama';
  let allowedUris: string[] = [];
  let isClientValid = false;

  const { data: clientData } = await adminSupabase
    .from('oauth_clients')
    .select('client_id, client_name, redirect_uris')
    .eq('client_id', clientId)
    .maybeSingle();

  if (clientData) {
    appName = clientData.client_name;
    allowedUris = Array.isArray(clientData.redirect_uris) ? clientData.redirect_uris : [clientData.redirect_uris];
    isClientValid = true;
  } else {
    // Geriye dönük uyumluluk: mastodon_apps tablosu
    const { data: legacyApp } = await adminSupabase
      .from('mastodon_apps')
      .select('name, redirect_uri')
      .eq('client_id', clientId)
      .maybeSingle();

    if (legacyApp) {
      appName = legacyApp.name;
      allowedUris = [legacyApp.redirect_uri];
      isClientValid = true;
    }
  }

  if (!isClientValid) {
    return (
      <div className="min-h-screen bg-[#fcf8fb] flex items-center justify-center p-4" style={{ fontFamily: 'sans-serif' }}>
        <div className="bg-white border-2 border-rose-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <AlertTriangle className="w-16 h-16 text-rose-600 mx-auto mb-4" />
          <h1 className="text-xl font-black mb-2 text-slate-800">Geçersiz İstemci (Client)</h1>
          <p className="text-sm text-slate-600 mb-6">
            <code className="font-mono text-xs bg-slate-100 p-1 rounded">{clientId}</code> kimliğine sahip kayıtlı bir OAuth istemcisi bulunamadı.
          </p>
          <a href="/" className="inline-block px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider">
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    );
  }

  const isUriAllowed = allowedUris.some((uri) => uri === redirectUri || (uri.includes('urn:ietf:wg:oauth:2.0:oob') && redirectUri.includes('urn:ietf:wg:oauth:2.0:oob')));
  if (!isUriAllowed) {
    return (
      <div className="min-h-screen bg-[#fcf8fb] flex items-center justify-center p-4" style={{ fontFamily: 'sans-serif' }}>
        <div className="bg-white border-2 border-rose-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <AlertTriangle className="w-16 h-16 text-rose-600 mx-auto mb-4" />
          <h1 className="text-xl font-black mb-2 text-slate-800">Geçersiz Yönlendirme Adresi</h1>
          <p className="text-sm text-slate-600 mb-6">
            İstenen yönlendirme adresi (<code className="font-mono text-xs bg-slate-100 p-1 rounded break-all">{redirectUri}</code>) bu istemcinin kayıtlı izinli adresleri ile eşleşmiyor.
          </p>
          <a href="/" className="inline-block px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider">
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    );
  }

  // 4. Kullanıcı oturumunu sunucuda kontrol ediyoruz (COOKIES!)
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    // Oturum yoksa, parametreleri kaybetmeden login sayfasına yönlendiriyoruz
    const loginParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope,
      state: state,
    });
    redirect(`/login?returnTo=${encodeURIComponent(`/oauth/authorize?${loginParams.toString()}`)}`);
  }

  // 5. Form Onaylandığında Çalışacak Sunucu Aksiyonu (Server Action)
  async function handleOAuthForm(formData: FormData) {
    'use server';

    const action = formData.get('action');
    const targetRedirect = (formData.get('redirect_uri') as string) || '';
    const currentClientId = (formData.get('client_id') as string) || '';
    const currentScope = (formData.get('scope') as string) || 'read';
    const currentState = (formData.get('state') as string) || '';

    if (action === 'deny') {
      if (!targetRedirect || targetRedirect.includes('urn:ietf:wg:oauth:2.0:oob')) {
        redirect('/?error=access_denied');
      }
      redirect(`${targetRedirect}${targetRedirect.includes('?') ? '&' : '?'}error=access_denied&state=${encodeURIComponent(currentState)}`);
    }

    // Onaylandı: Kriptografik güvenli tek kullanımlık 5 dakika geçerli kod üretimi
    const code = generateAuthorizationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 dakika

    const supabaseAction = await createClient();
    const { data: { user: actionUser } } = await supabaseAction.auth.getUser();

    if (!actionUser) {
      redirect(`/login?returnTo=${encodeURIComponent(`/oauth/authorize?client_id=${currentClientId}&redirect_uri=${encodeURIComponent(targetRedirect)}&state=${currentState}`)}`);
    }

    // Yetki kodunu oauth_codes tablosuna kaydet
    await adminSupabase.from('oauth_codes').insert({
      code,
      user_id: actionUser.id,
      client_id: currentClientId,
      redirect_uri: targetRedirect,
      scope: currentScope,
      expires_at: expiresAt,
      used: false,
    });

    // Eğer Out-of-Band (OOB) ise ekranda göster
    if (!targetRedirect || targetRedirect.includes('urn:ietf:wg:oauth:2.0:oob')) {
      redirect(`/oauth/authorize?show_oob_code=${code}`);
    }

    // İstemci uygulamaya yönlendir (Authorization Code Flow)
    const separator = targetRedirect.includes('?') ? '&' : '?';
    const stateParam = currentState ? `&state=${encodeURIComponent(currentState)}` : '';
    redirect(`${targetRedirect}${separator}code=${encodeURIComponent(code)}${stateParam}`);
  }

  // 6. Out-of-band kodu ekranı (Masaüstü/Terminal araçları için)
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
          <p className="text-[10px] text-slate-500 mt-4 font-bold">EngelsizForum Güvenli OAuth 2.0 Sağlayıcısı (5 dakika geçerlidir)</p>
        </div>
      </div>
    );
  }

  // 7. Standart Onay / İzin Arayüzü (Consent Screen)
  return (
    <div className="min-h-screen bg-[#fcf8fb] flex items-center justify-center p-4 w-full" style={{ fontFamily: 'sans-serif' }}>
      <div className="bg-white border-2 border-[#bdc9c6] rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="bg-[#185886] p-6 text-center border-b border-[#12466b] text-white">
          <div className="flex justify-center mb-3">
            <EngelsizForumLogo size="lg" showBackground={false} />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">EngelsizForum ile Giriş Yap</h1>
          <p className="text-xs text-sky-200 font-semibold uppercase tracking-wider mt-1">
            OAuth 2.0 Güvenli Kimlik Doğrulama
          </p>
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
            <span>Bu işlem sonucunda uygulama profil bilgilerinizi (kullanıcı adı, e-posta, kimlik) görebilecektir. Şifreniz asla paylaşılmaz.</span>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#3e4947] block ml-1">Talep Edilen İzinler</span>
            <div className="p-3 bg-white border border-[#bdc9c6] rounded-xl text-xs font-bold text-[#005c55] uppercase tracking-wider flex items-center gap-2">
              <span>🔑</span>
              <span>{scope}</span>
              <span className="text-slate-400 text-[11px] font-normal lowercase">(profil kimlik ve okuma izni)</span>
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
              className="h-12 bg-[#f0edf0] hover:bg-[#bdc9c6]/40 text-[#1c1b1d] font-black text-xs uppercase tracking-widest rounded-xl border border-[#bdc9c6] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <X size={16} /> REDDET
            </button>
            <button
              type="submit"
              name="action"
              value="allow"
              className="h-12 bg-[#005c55] hover:brightness-110 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md shadow-[#005c55]/10 flex items-center justify-center gap-2"
            >
              <Check size={16} /> ONAYLA
            </button>
          </form>
        </div>

        <footer className="p-4 bg-[#f0edf0]/50 text-center border-t border-[#bdc9c6]">
          <p className="text-[11px] text-[#3e4947] font-medium">
            Giriş Yapan Hesap: <strong className="text-[#1c1b1d]">{user?.email}</strong>
          </p>
        </footer>
      </div>
    </div>
  );
}
