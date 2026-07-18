'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Shield, Check, X, Loader2, Info } from 'lucide-react';
import { motion } from 'motion/react';

// --- Types ---
interface OAuthParams {
  client_id: string | null;
  redirect_uri: string | null;
  response_type: string | null;
  scope: string | null;
  state: string | null;
}

// --- Main Page Component ---
export default function OAuthAuthorizePage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Suspense fallback={<LoadingState />}>
        <AuthorizeForm />
      </Suspense>
    </main>
  );
}

// --- Loading Component ---
function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-4 animate-pulse">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-muted-foreground font-medium">Oturum kontrol ediliyor...</p>
    </div>
  );
}

// --- Form Component (Safe from Hydration errors) ---
function AuthorizeForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [appInfo, setAppInfo] = useState<{ name: string; website?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parse OAuth parameters
  const params: OAuthParams = {
    client_id: searchParams.get('client_id'),
    redirect_uri: searchParams.get('redirect_uri'),
    response_type: searchParams.get('response_type'),
    scope: searchParams.get('scope'),
    state: searchParams.get('state'),
  };

  useEffect(() => {
    async function checkAuthAndClient() {
      try {
        // 1. Check user session
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          // If not logged in, redirect to login while preserving OAuth params
          const currentParams = new URLSearchParams(searchParams.toString());
          router.push(`/login?returnTo=${encodeURIComponent(`/oauth/authorize?${currentParams.toString()}`)}`);
          return;
        }
        setUser(authUser);

        // 2. Validate Client ID
        if (!params.client_id) {
          setError('Hatalı istek: client_id bulunamadı.');
          setIsLoading(false);
          return;
        }

        // Try to find the app in mastodon_apps table (created during app registration)
        const { data: appData, error: appError } = await supabase
          .from('mastodon_apps')
          .select('name, website')
          .eq('client_id', params.client_id)
          .single();

        if (appError || !appData) {
          setAppInfo({ name: 'Harici Uygulama' });
        } else {
          setAppInfo(appData);
        }

      } catch (err) {
        setError('Beklenmedik bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    }

    checkAuthAndClient();
  }, [params.client_id, router, searchParams, supabase]);

  const handleAuthorize = async () => {
    if (!params.redirect_uri) return;

    try {
      setIsLoading(true);
      // Generate a temporary authorization code
      const code = crypto.randomUUID();
      
      // Store the code in database
      const { error: storeError } = await supabase
        .from('oauth_codes')
        .insert({
          code,
          user_id: user.id,
          client_id: params.client_id,
          scope: params.scope,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        });

      if (storeError) throw storeError;

      // Redirect back to the app
      const redirectUrl = new URL(params.redirect_uri);
      redirectUrl.searchParams.set('code', code);
      if (params.state) redirectUrl.searchParams.set('state', params.state);
      
      window.location.href = redirectUrl.toString();
    } catch (err) {
      setError('İzin verilirken bir hata oluştu.');
      setIsLoading(false);
    }
  };

  const handleDeny = () => {
    if (!params.redirect_uri) {
      router.push('/');
      return;
    }
    const redirectUrl = new URL(params.redirect_uri);
    redirectUrl.searchParams.set('error', 'access_denied');
    if (params.state) redirectUrl.searchParams.set('state', params.state);
    window.location.href = redirectUrl.toString();
  };

  if (isLoading) return <LoadingState />;

  if (error) {
    return (
      <div className="vibe-card p-8 border-destructive max-w-md w-full text-center">
        <X className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Erişim Hatası</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button onClick={() => router.push('/')} className="vibe-button-secondary w-full">Ana Sayfaya Dön</button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="vibe-card p-0 overflow-hidden border-2 border-border max-w-lg w-full shadow-2xl rounded-[2.5rem]"
    >
      <div className="bg-primary/5 p-8 sm:p-12 text-center border-b border-border">
        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Erişim Onayı</h1>
        <p className="text-muted-foreground font-medium">Uygulama Yetkilendirme İsteği</p>
      </div>

      <div className="p-8 sm:p-12 space-y-8">
        <section aria-labelledby="request-heading" className="text-center">
          <h2 id="request-heading" className="text-lg sm:text-xl font-bold leading-relaxed mb-4">
            <span className="text-primary">{appInfo?.name}</span> uygulaması, 
            <br />
            <span className="font-black text-foreground">Engelsiz Forum</span> hesabınıza erişmek istiyor.
          </h2>
          <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-2xl flex items-center gap-3 justify-center text-left">
            <Info size={16} className="text-primary flex-shrink-0" />
            <span>Bu işlem sonucunda uygulama sizin adınıza işlem yapabilir, gönderilerinizi görebilir.</span>
          </div>
        </section>

        <section aria-labelledby="scope-heading">
          <h3 id="scope-heading" className="vibe-label mb-4">TALEP EDİLEN İZİNLER</h3>
          <ul className="space-y-3">
            {params.scope?.split(' ').map((s) => (
              <li key={s} className="flex items-center gap-3 text-sm font-medium p-3 bg-card border border-border rounded-xl">
                <div className="size-5 bg-primary/20 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-primary" />
                </div>
                <span className="uppercase tracking-wider opacity-80">{s}</span>
              </li>
            )) || <li className="text-muted-foreground italic">Varsayılan okuma izni</li>}
          </ul>
        </section>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <button
            onClick={handleDeny}
            className="vibe-button-secondary py-4 flex items-center justify-center gap-2 group"
            aria-label="Erişimi Reddet"
          >
            <X size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-bold">REDDET</span>
          </button>
          <button
            onClick={handleAuthorize}
            className="vibe-button py-4 flex items-center justify-center gap-2 group"
            aria-label="Erişimi Onayla"
          >
            <Check size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-bold">ONAYLA</span>
          </button>
        </div>
      </div>

      <footer className="p-6 bg-muted/30 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">
          Giriş yapan kullanıcı: <span className="font-bold text-foreground">{user?.email}</span>
        </p>
      </footer>
    </motion.div>
  );
}
