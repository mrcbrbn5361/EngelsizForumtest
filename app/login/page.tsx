'use client';

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
        <Loader2 className="animate-spin text-indigo-400 size-6" />
        <span className="text-xs text-slate-400 font-mono">Giriş ekranı hazırlanıyor...</span>
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
  const destination = searchParams?.get('redirect') || searchParams?.get('redirectTo') || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
      <div className="bg-[#111B2E] border border-[#1E293B] px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-400 rounded-md font-mono">
        <Link href="/" className="hover:text-indigo-400 flex items-center gap-1.5 font-sans font-medium transition-colors">
          <Home size={13} />
          <span>Ana Sayfa</span>
        </Link>
        <span className="text-slate-600">/</span>
        <span className="font-semibold text-slate-200 font-sans">Giriş Yap</span>
      </div>

      {/* Main Login Card */}
      <div className="bg-[#111B2E] border border-[#1E293B] rounded-lg overflow-hidden shadow-xl">
        {/* Card Header */}
        <div className="bg-[#18243A] text-white p-5 sm:p-6 border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <LogIn size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white font-heading">
                Üye Girişi
              </h1>
              <p className="text-xs text-slate-400 font-normal">
                EngelsizForum bağımsız topluluk hesabınıza erişin
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[11px] font-mono font-medium text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded">
            WCAG 2.2 AA
          </span>
        </div>
        
        {/* Card Body */}
        <div className="p-6 sm:p-7 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label 
                htmlFor="login-email" 
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
              >
                E-posta Adresi <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input 
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 h-11 text-xs sm:text-sm font-medium bg-[#18243A] border border-[#1E293B] rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-colors"
                  placeholder="ornek@engelsizforum.com"
                  autoComplete="email"
                  required
                />
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label 
                  htmlFor="login-password" 
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
                >
                  Şifre <span className="text-rose-400">*</span>
                </label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
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
                  className="w-full pl-10 pr-3.5 h-11 text-xs sm:text-sm font-medium bg-[#18243A] border border-[#1E293B] rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-colors"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox" 
                id="remember" 
                className="w-4 h-4 rounded border-[#1E293B] bg-[#18243A] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer" 
              />
              <label htmlFor="remember" className="text-xs font-normal text-slate-300 cursor-pointer select-none">
                Oturumumu bu cihazda açık tut
              </label>
            </div>

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
                className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Hesabınız yok mu? <span className="text-indigo-400 font-semibold underline underline-offset-4">Hemen Kayıt Olun</span>
              </Link>
            </div>
          </form>

          {/* Social Sign-in Divider */}
          <div className="pt-5 border-t border-[#1E293B] space-y-3">
            <p className="text-[11px] text-slate-500 font-mono font-semibold uppercase text-center tracking-wider">
              Veya Alternatif Giriş
            </p>
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-11 border border-[#1E293B] bg-[#18243A] hover:bg-[#1E293B] rounded-md px-4 flex items-center justify-center gap-2.5 transition-colors text-xs font-medium text-slate-200 cursor-pointer"
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
