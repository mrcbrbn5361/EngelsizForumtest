'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SiteLayout } from '@/components/layout/site-layout';
import { Loader2, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Giriş yapılıyor, lütfen bekleyin...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const processAuthCallback = async () => {
      try {
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const errorDesc = urlParams.get('error_description') || hashParams.get('error_description') || urlParams.get('error') || hashParams.get('error');

          if (errorDesc) {
            if (mounted) {
              setIsError(true);
              const cleanErr = decodeURIComponent(errorDesc).replace(/\+/g, ' ');
              setMessage(`Giriş tamamlanamadı: ${cleanErr}`);
            }
            setTimeout(() => {
              if (mounted) {
                router.replace(`/login?error=${encodeURIComponent('Google ile giriş işlemi tamamlanamadı veya yapılandırılmamış.')}`);
              }
            }, 2000);
            return;
          }
        }

        // Active check for session from PKCE code or URL hash
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback getSession error:", error);
        }

        if (session && mounted) {
          setMessage('Giriş başarılı! Topluluğa yönlendiriliyorsunuz...');
          const hash = typeof window !== 'undefined' ? window.location.hash || '' : '';
          if (hash.includes('type=recovery') || hash.includes('type=password_recovery')) {
            router.replace('/auth/reset-password');
          } else {
            router.replace('/discussions');
          }
          return;
        }
      } catch (err) {
        console.error("Auth callback processing exception:", err);
      }
    };

    processAuthCallback();

    // Listen to onAuthStateChange for SIGNED_IN event
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'PASSWORD_RECOVERY') {
        setMessage('Şifre sıfırlama sayfasına yönlendiriliyorsunuz...');
        router.replace('/auth/reset-password');
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session) {
        setMessage('Giriş başarılı! Topluluğa yönlendiriliyorsunuz...');
        router.replace('/discussions');
      }
    });

    // Fallback timer: only redirect to login if session couldn't be obtained after 3s
    const fallbackTimeout = setTimeout(async () => {
      if (!mounted) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setMessage('Giriş başarılı! Topluluğa yönlendiriliyorsunuz...');
        router.replace('/discussions');
      } else {
        console.warn("No active session found during auth callback. Redirecting to login page.");
        setIsError(true);
        setMessage('Google oturumu doğrulanamadı. Giriş sayfasına yönlendiriliyorsunuz...');
        setTimeout(() => {
          if (mounted) {
            router.replace('/login?error=' + encodeURIComponent('Google oturumu doğrulanamadı. Lütfen e-posta ve şifrenizle giriş yapın.'));
          }
        }, 1500);
      }
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(fallbackTimeout);
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <SiteLayout>
      <div className="flex-1 min-h-[60vh] flex items-center justify-center p-6 bg-gradient-to-b from-muted/10 to-muted/30">
        <div className="vibe-card p-10 text-center space-y-6 max-w-md w-full shadow-2xl rounded-3xl border-2 border-border bg-card">
          <div className="flex justify-center">
            {isError ? (
              <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-bold text-xl">
                <AlertCircle size={28} />
              </div>
            ) : (
              <Loader2 className="animate-spin text-primary mx-auto" size={44} />
            )}
          </div>
          <h2 className="text-xl font-black text-foreground">{message}</h2>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            ENGELSİZ ERİŞİM SİSTEMİ
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
