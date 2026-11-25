'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AuthCard } from '@/components/auth/auth-card';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatAuthError, sanitizeRedirectPath as sanitizeRedirectUrl } from '@/lib/auth-utils';

const CROSS_DEVICE_RECOVERY_ERROR =
  'Şifre sıfırlama bağlantısı doğrulanamadı. Bağlantıyı, sıfırlamayı istediğiniz tarayıcıda açın ya da yeni bir bağlantı isteyin.';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Giriş doğrulanıyor, lütfen bekleyin...');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    let mounted = true;
    let finished = false;

    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash || '';
    // Password reset links carry type=recovery (in the query for PKCE, in the hash for the implicit flow).
    // Every successful path below must then go to the reset page, never into the site as a normal sign-in.
    const isRecovery = params.get('type') === 'recovery' || /type=(password_)?recovery/.test(hash);
    const successPath = isRecovery ? '/auth/reset-password' : sanitizeRedirectUrl(params.get('next'));

    const finish = (path: string, text: string, state: 'success' | 'error' = 'success') => {
      if (!mounted || finished) return;
      finished = true;
      setStatus(state);
      setMessage(text);
      router.replace(path);
    };
    const succeed = () =>
      finish(successPath, isRecovery ? 'Şifre sıfırlama sayfasına yönlendiriliyorsunuz...' : 'Giriş başarılı! Yönlendiriliyorsunuz...');

    const processAuthCallback = async () => {
      try {
        const hashParams = new URLSearchParams(hash.substring(1));
        const errorDesc = params.get('error_description') || hashParams.get('error_description') ||
                          params.get('error') || hashParams.get('error');

        if (errorDesc) {
          const cleanErr = decodeURIComponent(errorDesc).replace(/\+/g, ' ');
          if (isRecovery) {
            finish(`/auth/forgot-password?error=${encodeURIComponent(CROSS_DEVICE_RECOVERY_ERROR)}`, CROSS_DEVICE_RECOVERY_ERROR, 'error');
            return;
          }
          if (mounted) {
            setStatus('error');
            setMessage(formatAuthError(cleanErr, 'Giriş işlemi tamamlanamadı. Lütfen e-posta veya şifrenizi kontrol edin.'));
          }
          setTimeout(() => finish(`/login?error=${encodeURIComponent('Giriş işlemi tamamlanamadı.')}`, 'Giriş sayfasına yönlendiriliyorsunuz...', 'error'), 2500);
          return;
        }

        // getSession waits for the client to start. In the browser that requested the link the client
        // has already exchanged the ?code= itself at that point, so exchanging it again would fail.
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          succeed();
          return;
        }

        const code = params.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeError) {
            succeed();
            return;
          }
          console.error('Code exchange error:', exchangeError);
          if (isRecovery) {
            finish(`/auth/forgot-password?error=${encodeURIComponent(CROSS_DEVICE_RECOVERY_ERROR)}`, CROSS_DEVICE_RECOVERY_ERROR, 'error');
          }
        }
      } catch (err) {
        console.error('Auth callback processing exception:', err);
      }
    };

    // The client reports a session found in the URL through these events.
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        finish('/auth/reset-password', 'Şifre sıfırlama sayfasına yönlendiriliyorsunuz...');
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session) {
        succeed();
      }
    });

    processAuthCallback();

    // Fallback if neither path above has finished.
    const fallbackTimeout = setTimeout(async () => {
      if (!mounted || finished) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        succeed();
      } else if (isRecovery) {
        finish(`/auth/forgot-password?error=${encodeURIComponent(CROSS_DEVICE_RECOVERY_ERROR)}`, CROSS_DEVICE_RECOVERY_ERROR, 'error');
      } else {
        if (mounted) {
          setStatus('error');
          setMessage('Oturum doğrulanamadı. Giriş sayfasına yönlendiriliyorsunuz...');
        }
        setTimeout(() => finish('/login?error=' + encodeURIComponent('Oturum doğrulanamadı. Lütfen tekrar giriş yapın.'), 'Oturum doğrulanamadı.', 'error'), 1500);
      }
    }, 3500);

    return () => {
      mounted = false;
      clearTimeout(fallbackTimeout);
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div role="status" aria-live="polite">
      <AuthCard
        crumb="Doğrulama"
        icon={status === 'error' ? AlertCircle : status === 'success' ? CheckCircle2 : Loader2}
        iconClassName={status === 'loading' ? 'animate-spin' : undefined}
        tone={status === 'error' ? 'error' : status === 'success' ? 'success' : 'default'}
        title={message}
        subtitle="EngelsizForum güvenli kimlik doğrulama"
      />
    </div>
  );
}

