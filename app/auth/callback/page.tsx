'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SiteLayout } from '@/components/layout/site-layout';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Giriş yapılıyor, lütfen bekleyin...');

  useEffect(() => {
    let mounted = true;

    const processAuthCallback = async () => {
      try {
        // Active check for session from PKCE code or URL hash
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback getSession error:", error);
        }

        if (session && mounted) {
          setMessage('Giriş başarılı! Topluluğa yönlendiriliyorsunuz...');
          const hash = window.location.hash || '';
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

    // Fallback timer: only redirect to login if session couldn't be obtained after 3.5s
    const fallbackTimeout = setTimeout(async () => {
      if (!mounted) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setMessage('Giriş başarılı! Topluluğa yönlendiriliyorsunuz...');
        router.replace('/discussions');
      } else {
        console.warn("No active session found during auth callback. Redirecting to login page.");
        router.replace('/login');
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
      <div className="vibe-container min-h-[60vh] flex items-center justify-center">
        <div className="vibe-card p-12 text-center space-y-4 shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-xl font-black text-foreground">{message}</p>
        </div>
      </div>
    </SiteLayout>
  );
}
