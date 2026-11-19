'use client';

import { sanitizeRedirectPath } from '@/lib/auth-utils';
import { rememberCookieString } from '@/lib/session-persistence';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import Link from 'next/link';
import { toast } from 'sonner';
import { Home, LogIn, Lock, Mail, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[360px] gap-2">
        <Loader2 className="animate-spin text-indigo-400 light:text-indigo-700 size-6" />
        <span className="text-xs text-fg-4 font-mono">Giriş ekranı hazırlanıyor...</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = sanitizeRedirectPath(searchParams?.get('redirect') || searchParams?.get('redirectTo'), '/');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  const saveRememberChoice = () => {
    document.cookie = rememberCookieString(remember, window.location.protocol === 'https:');
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.push(destination);
    }
  }, [user, authLoading, router, destination]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      saveRememberChoice();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (signInError) throw signInError;

      toast.success('Giriş başarılı! Yönlendiriliyorsunuz...');
      router.push(destination);
    } catch (err: any) {
      toast.error('Giriş yapılamadı: ' + (err.message || 'Geçersiz e-posta veya şifre'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      saveRememberChoice();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error('Google ile giriş hatası: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto w-full py-6 sm:py-10 px-4">
      {/* Breadcrumb Navigation */}
      <div className="bg-surface-raised border border-line px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-fg-4 rounded-md font-mono">
        <Link href="/" className="hover:text-indigo-400 light:hover:text-indigo-700 flex items-center gap-1.5 font-sans font-medium transition-colors">
          <Home size={13} />
          <span>Ana Sayfa</span>
        </Link>
        <span className="text-fg-6">/</span>
        <span className="font-semibold text-fg-2 font-sans">Giriş Yap</span>
      </div>

      {/* Main Login Card */}
      <div className="bg-surface-raised border border-line rounded-lg overflow-hidden shadow-xl">
        {/* Card Header */}
        <div className="bg-surface-hover text-fg p-5 sm:p-6 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-indigo-500/20 text-indigo-400 light:text-indigo-700 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <LogIn size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-fg font-heading">
                Üye Girişi
              </h1>
              <p className="text-xs text-fg-4 font-normal">
                EngelsizForum bağımsız topluluk hesabınıza erişin
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[11px] font-mono font-medium text-indigo-300 light:text-indigo-700 bg-indigo-950/60 light:bg-indigo-50/60 border border-indigo-800/60 px-2 py-0.5 rounded">
            WCAG 2.2 AA
          </span>
        </div>
        
        {/* Card Body */}
        <div className="p-6 sm:p-7 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label 
                htmlFor="login-email" 
                className="block text-xs font-semibold text-fg-3 uppercase tracking-wider"
              >
                E-posta Adresi <span className="text-rose-400 light:text-rose-700">*</span>
              </label>
              <div className="relative">
                <input 
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 h-11 text-xs sm:text-sm font-medium bg-surface-hover border border-line rounded-md text-fg placeholder-fg-5 focus:outline-none focus:border-indigo-400 light:focus:border-indigo-700 transition-colors"
                  placeholder="ornek@engelsizforum.com"
                  autoComplete="email"
                  required
                />
                <Mail size={16} className="absolute left-3.5 top-3.5 text-fg-4 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label 
                  htmlFor="login-password" 
                  className="block text-xs font-semibold text-fg-3 uppercase tracking-wider"
                >
                  Şifre <span className="text-rose-400 light:text-rose-700">*</span>
                </label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-xs font-medium text-indigo-400 light:text-indigo-700 hover:text-indigo-300 light:hover:text-indigo-700 transition-colors"
                >
                  Şifremi Unuttum?
                </Link>
              </div>
              <div className="relative">
                <input 
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 h-11 text-xs sm:text-sm font-medium bg-surface-hover border border-line rounded-md text-fg placeholder-fg-5 focus:outline-none focus:border-indigo-400 light:focus:border-indigo-700 transition-colors"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-3.5 text-fg-4 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox" 
                id="remember" 
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                aria-describedby="remember-hint"
                className="w-4 h-4 rounded border-line bg-surface-hover text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer" 
              />
              <label htmlFor="remember" className="text-xs font-normal text-fg-3 cursor-pointer select-none">
                Oturumumu bu cihazda açık tut
              </label>
            </div>
            <p id="remember-hint" className="text-[11px] text-fg-4 -mt-1 pl-6">
              Ortak bir bilgisayardaysanız işareti kaldırın; tarayıcı kapanınca oturumunuz kapanır.
            </p>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Giriş Yapılıyor...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Giriş Yap</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link 
                href="/register" 
                className="text-xs font-medium text-fg-4 hover:text-fg transition-colors"
              >
                Hesabınız yok mu? <span className="text-indigo-400 light:text-indigo-700 font-semibold underline underline-offset-4">Hemen Kayıt Olun</span>
              </Link>
            </div>
          </form>

          {/* Social Sign-in Divider */}
          <div className="pt-5 border-t border-line space-y-3">
            <p className="text-[11px] text-fg-5 font-mono font-semibold uppercase text-center tracking-wider">
              Veya Alternatif Giriş
            </p>
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-11 border border-line bg-surface-hover hover:bg-line rounded-md px-4 flex items-center justify-center gap-2.5 transition-colors text-xs font-medium text-fg-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google Hesabı ile Giriş Yap</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
