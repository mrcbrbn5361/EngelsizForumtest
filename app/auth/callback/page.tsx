'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SiteLayout } from '@/components/layout/site-layout';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatAuthError } from '@/lib/auth-utils';

function sanitizeRedirectUrl(url: string | null): string {
  if (!url) return '/discussions';
  // Allow internal relative paths only (must start with / and not //)
  if (url.startsWith('/') && !url.startsWith('//') && !url.includes('javascript:')) {
    return url;
  }
  return '/discussions';
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Giriş doğrulanıyor, lütfen bekleyin...');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    let mounted = true;

    const processAuthCallback = async () => {
      try {
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          
          const errorDesc = urlParams.get('error_description') || 
                            hashParams.get('error_description') || 
                            urlParams.get('error') || 
                            hashParams.get('error');

          if (errorDesc) {
            if (mounted) {
              setStatus('error');
              const cleanErr = decodeURIComponent(errorDesc).replace(/\+/g, ' ');
              setMessage(formatAuthError(cleanErr, 'Giriş işlemi tamamlanamadı. Lütfen e-posta veya şifrenizi kontrol edin.'));
            }
            setTimeout(() => {
              if (mounted) {
                router.replace(`/login?error=${encodeURIComponent('Google ile giriş işlemi tamamlanamadı.')}`);
              }
            }, 2500);
            return;
          }

          // Check if there's a code parameter for PKCE code exchange
          const code = urlParams.get('code');
          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              console.error('Code exchange error:', exchangeError);
            }
          }
        }

        // Active check for session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback getSession error:", error);
        }

        if (session && mounted) {
          setStatus('success');
          setMessage('Giriş başarılı! Topluluğa yönlendiriliyorsunuz...');
          
          const hash = typeof window !== 'undefined' ? window.location.hash || '' : '';
          const search = typeof window !== 'undefined' ? window.location.search || '' : '';
          
          if (hash.includes('type=recovery') || hash.includes('type=password_recovery') || search.includes('type=recovery')) {
            router.replace('/auth/reset-password');
          } else {
            const targetUrl = sanitizeRedirectUrl(typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') : null);
            router.replace(targetUrl);
          }
          return;
        }
      } catch (err) {
        console.error("Auth callback processing exception:", err);
      }
    };

    processAuthCallback();

    // Listen to onAuthStateChange for SIGNED_IN or recovery events
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'PASSWORD_RECOVERY') {
        setStatus('success');
        setMessage('Şifre sıfırlama sayfasına yönlendiriliyorsunuz...');
        router.replace('/auth/reset-password');
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session) {
        setStatus('success');
        setMessage('Giriş onaylandı! Topluluğa aktarılıyorsunuz...');
        const targetUrl = sanitizeRedirectUrl(typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') : null);
        router.replace(targetUrl);
      }
    });

    // Fallback timer
    const fallbackTimeout = setTimeout(async () => {
      if (!mounted) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStatus('success');
        setMessage('Giriş başarılı! Yönlendiriliyorsunuz...');
        router.replace('/discussions');
      } else {
        setStatus('error');
        setMessage('Oturum doğrulanamadı. Giriş sayfasına yönlendiriliyorsunuz...');
        setTimeout(() => {
          if (mounted) {
            router.replace('/login?error=' + encodeURIComponent('Oturum doğrulanamadı. Lütfen tekrar giriş yapın.'));
          }
        }, 1500);
      }
    }, 3500);

    return () => {
      mounted = false;
      clearTimeout(fallbackTimeout);
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <SiteLayout>
      <div className="flex-1 min-h-[60vh] flex items-center justify-center p-6 bg-gradient-to-b from-muted/10 to-muted/30">
        <main 
          role="status" 
          aria-live="polite" 
          className="p-10 text-center space-y-6 max-w-md w-full shadow-2xl rounded-3xl border border-white/[0.08] bg-[#111726]/90 backdrop-blur-md"
        >
          <div className="flex justify-center">
            {status === 'error' ? (
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20">
                <AlertCircle size={30} aria-hidden="true" />
              </div>
            ) : status === 'success' ? (
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 size={30} aria-hidden="true" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                <Loader2 className="animate-spin" size={30} aria-hidden="true" />
              </div>
            )}
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-100">{message}</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            ENGELSİZFORUM GÜVENLİ KİMLİK DOĞRULAMA
          </p>
        </main>
      </div>
    </SiteLayout>
  );
}

