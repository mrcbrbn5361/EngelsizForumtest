'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Shield, Check, X, AlertTriangle, KeyRound, Mail, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

function AuthorizeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const clientId = searchParams.get('client_id') || '';
  const redirectUri = searchParams.get('redirect_uri') || '';
  const scope = searchParams.get('scope') || 'read write follow';
  const state = searchParams.get('state') || '';
  const responseType = searchParams.get('response_type') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // Parse client name from client_id
  let clientName = 'Harici Uygulama';
  if (clientId.startsWith('ef_client_')) {
    try {
      const hexName = clientId.slice(10);
      const decoded = Buffer.from(hexName, 'hex').toString('utf8');
      if (decoded) clientName = decoded;
    } catch (e) {
      // Fallback
    }
  }

  useEffect(() => {
    // Check current session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Fetch profile
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (prof) setProfile(prof);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || 'Giriş başarısız oldu.');
      } else if (data?.user) {
        setUser(data.user);
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        if (prof) setProfile(prof);
        toast.success('Giriş başarılı!');
      }
    } catch (err: any) {
      toast.error('Giriş yapılırken beklenmedik bir hata oluştu.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthorize = async () => {
    if (!user) return;

    try {
      // Generate standard stateful or stateless code containing user info
      const codePayload = {
        userId: user.id,
        clientId,
        scope,
        createdAt: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
      };
      
      const code = Buffer.from(JSON.stringify(codePayload)).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, ''); // base64url

      toast.success('Uygulama başarıyla yetkilendirildi. Yönlendiriliyorsunuz...');

      // Redirect back to client app
      setTimeout(() => {
        let redirectUrl = redirectUri;
        const separator = redirectUrl.includes('?') ? '&' : '?';
        redirectUrl += `${separator}code=${code}`;
        if (state) {
          redirectUrl += `&state=${encodeURIComponent(state)}`;
        }
        window.location.href = redirectUrl;
      }, 1000);

    } catch (err) {
      toast.error('Yetkilendirme sırasında hata oluştu.');
    }
  };

  const handleCancel = () => {
    toast.error('Yetkilendirme iptal edildi.');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Oturum kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-lg">
        {/* App Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-primary text-primary-foreground rounded-3xl select-none shadow-xl shadow-primary/20 mb-3">
            <span className="text-3xl font-black">E</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight uppercase">
            ENGELSİZ<span className="text-primary">FORUM</span>
          </h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Mobil Uygulama Bağlantısı</p>
        </div>

        {!user ? (
          /* LOGIN FORM */
          <div className="vibe-card border-2 border-border shadow-2xl relative overflow-hidden rounded-[2.5rem] bg-card">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent -z-10" />
            
            <div className="text-center mb-6">
              <div className="h-12 w-12 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <KeyRound size={24} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Önce Giriş Yapın</h2>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-1">
                {clientName} uygulamasına bağlanmak için giriş yapmalısınız.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="vibe-label" htmlFor="email">E-POSTA ADRESİ</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@engelsizforum.com"
                    className="vibe-input vibe-input-pl-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="vibe-label" htmlFor="password">ŞİFRE</label>
                <div className="relative">
                  <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="vibe-input vibe-input-pl-12"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full vibe-button-primary mt-2"
              >
                {authLoading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP VE DEVAM ET'}
              </button>
            </form>
          </div>
        ) : (
          /* PERMISSION APPROVAL CARD */
          <div className="vibe-card border-2 border-border shadow-2xl relative overflow-hidden rounded-[2.5rem] bg-card">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent -z-10" />

            <div className="flex items-center gap-4 p-4 bg-muted/60 border-2 border-border rounded-2xl mb-6">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                <UserCheck size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Bağlı Hesap</p>
                <p className="text-sm font-black text-foreground truncate mt-1">
                  {profile?.full_name || user.email?.split('@')[0]}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground truncate uppercase tracking-widest mt-0.5">
                  @{profile?.username || 'uye'}
                </p>
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="h-14 w-14 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-3 border border-primary/20">
                <Shield size={32} className="animate-pulse" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-foreground">YETKİLENDİRME İSTEĞİ</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                <span className="text-primary font-black">{clientName}</span>, EngelsizForum hesabınıza bağlanmak istiyor.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="vibe-label">İSTENECEK ERİŞİM İZİNLERİ:</h3>
              
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-foreground uppercase tracking-wider">Okuma Yetkisi (read)</p>
                    <p className="text-[10px] font-bold text-muted-foreground mt-0.5">Profil bilgilerinizi, takipçilerinizi, tartışmaları ve yorumları görme.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-foreground uppercase tracking-wider">Yazma Yetkisi (write)</p>
                    <p className="text-[10px] font-bold text-muted-foreground mt-0.5">Sizin adınıza tartışma açma, yorum yapma ve tepki verme.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-foreground uppercase tracking-wider">Takip Yetkisi (follow)</p>
                    <p className="text-[10px] font-bold text-muted-foreground mt-0.5">Kullanıcıları takip etme, engelleme veya sessize alma.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleCancel}
                className="inline-flex items-center justify-center rounded-2xl border-2 border-border px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all active:scale-95 h-14"
              >
                <X size={16} className="mr-2" /> REDDET
              </button>
              
              <button
                onClick={handleAuthorize}
                className="vibe-button-primary h-14"
              >
                <Check size={16} className="mr-2" /> ONAYLA
              </button>
            </div>
          </div>
        )}
        
        {/* Help footer info */}
        <div className="mt-6 flex items-center gap-2 justify-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <AlertTriangle size={12} />
          <span>YALNIZCA GÜVENDİĞİNİZ MOBİL İSTEMCİLERE ERİŞİM İZNİ VERİN.</span>
        </div>
      </div>
    </div>
  );
}

export default function AuthorizePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    }>
      <AuthorizeContent />
    </Suspense>
  );
}
