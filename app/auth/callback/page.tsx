'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Giriş yapılıyor, lütfen bekleyin...');

  useEffect(() => {
    let mounted = true;

    const handleAuth = async () => {
      // First, let's see if we explicitly arrived here for password recovery
      // PKCE flow changes in Supabase 2.x means we might just get a 'code' and 
      // the exchange happens automatically in the background. Note that this page
      // needs to wait for the onAuthStateChange event to reliably detect PASSWORD_RECOVERY.
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
        // Wait a little bit to see if a PASSWORD_RECOVERY event follows it
        // In the PKCE flow, Supabase sometimes fires SIGNED_IN right before PASSWORD_RECOVERY
        redirectTimeout = setTimeout(() => {
          if (mounted) {
            router.push('/');
          }
        }, 500);
      } else if (event === 'SIGNED_OUT') {
        router.push('/auth');
      }
    });

    // Fallback: If no event fires quickly, we check session and redirect
    const fallbackTimeout = setTimeout(async () => {
      if (!mounted) return;
      const { data } = await supabase.auth.getSession();
      if (data?.session && window.location.pathname === '/auth/callback') {
          // Check if this is a password recovery session, if so, redirect to reset-password
          // Supabase doesn't easily expose this in getSession, but we can check the URL
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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="text-xl font-bold">{message}</p>
      </div>
    </div>
  );
}
