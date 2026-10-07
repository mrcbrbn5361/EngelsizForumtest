'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import Link from 'next/link';
import { toast } from 'sonner';
import { Home, LogIn, Lock, Mail, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (signInError) throw signInError;

      toast.success('Giriş başarılı!');
      router.push('/');
    } catch (err: any) {
      toast.error('Giriş yapılamadı: ' + err.message);
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
    <div className="flex flex-col gap-5 max-w-xl mx-auto w-full py-4 sm:py-8">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-900 px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <Link href="/" className="hover:text-sky-600 flex items-center gap-1 font-bold">
          <Home size={14} />
          <span>Ana Sayfa</span>
        </Link>
        <span className="opacity-40">/</span>
        <span className="font-extrabold text-slate-950 dark:text-white">Giriş Yap</span>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b-2 border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
              <LogIn size={18} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight">Üye Girişi</h1>
              <p className="text-xs text-slate-400">EngelsizForum Topluluk Hesabınıza Giriş Yapın</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 sm:p-8 space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                E-posta Adresi:
              </label>
              <div className="relative">
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 h-11 text-xs font-semibold bg-slate-50 dark:bg-slate-950/60 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 transition-all"
                  placeholder="adiniz@ornek.com"
                  required
                />
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Şifre:
                </label>
                <Link href="/auth/forgot-password" className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline">
                  Şifremi Unuttum?
                </Link>
              </div>
              <div className="relative">
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 h-11 text-xs font-semibold bg-slate-50 dark:bg-slate-950/60 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 transition-all"
                  placeholder="••••••••"
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
               <input type="checkbox" id="remember" className="rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
               <label htmlFor="remember" className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                 Oturumu açık tut
               </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
              <Button 
                type="submit"
                disabled={loading}
                variant="primary"
                size="default"
                className="w-full sm:w-auto px-8 gap-2 font-black uppercase text-xs tracking-wider"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                <span>Giriş Yap</span>
              </Button>

              <Link href="/register" className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                Hesabınız yok mu? <strong className="text-sky-600 dark:text-sky-400 underline">Kayıt Olun</strong>
              </Link>
            </div>
          </form>

          <div className="pt-6 border-t-2 border-slate-100 dark:border-slate-800 space-y-3">
             <p className="text-[11px] text-slate-500 font-extrabold uppercase text-center tracking-wider">
               Veya Sosyal Hesap ile Devam Edin
             </p>
             <button 
              onClick={handleGoogleLogin}
              className="w-full h-11 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-2 flex items-center justify-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs cursor-pointer"
             >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                <span>Google Hesabı ile Giriş Yap</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
