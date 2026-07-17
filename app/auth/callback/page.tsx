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

    const handleAuth = async () => {
    };

    handleAuth();

    let redirectTimeout: NodeJS.Timeout;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth callback event:', event);

      if (event === 'PASSWORD_RECOVERY') {
        clearTimeout(redirectTimeout);
        setMessage('Şifre sıfırlama sayfasına yönlendiriliyorsunuz...');
        router.push('/auth/reset-password');
      } else if (event === 'SIGNED_IN' && session) {
        redirectTimeout = setTimeout(() => {
          if (mounted) {
            router.push('/');
          }
        }, 500);
      } else if (event === 'SIGNED_OUT') {
        router.push('/auth');
      }
    });

    const fallbackTimeout = setTimeout(async () => {
      if (!mounted) return;
      const { data } = await supabase.auth.getSession();
      if (data?.session && window.location.pathname === '/auth/callback') {
          if (window.location.hash.includes('type=recovery') || window.location.hash.includes('type=password_recovery')) {
              router.push('/auth/reset-password');
          } else {
              router.push('/');
          }
      } else if (!data?.session) {
          router.push('/auth');
      }
    }, 2000);

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
