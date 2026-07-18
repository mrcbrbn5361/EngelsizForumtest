'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SiteLayout } from '@/components/layout/site-layout';
import { useAuth } from '@/components/providers/auth-provider';
import { LogIn, UserPlus, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

/**
 * Accessible Auth Page for EngelsizForum with Google Login.
 */
export default function AuthPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/discussions');
    }
  }, [user, authLoading, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin && password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Geçerli bir e-posta adresi giriniz.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
           if (error.message?.includes('Invalid login credentials')) throw new Error('E-posta veya şifre hatalı.');
           if (error.message?.includes('Email not confirmed')) throw new Error('Lütfen e-posta adresinizi doğrulayın.');
           throw error;
        }
        router.push('/discussions');
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              username: username || email.split('@')[0],
              full_name: username || email.split('@')[0],
            }
          }
        });
        if (error) throw error;
        setError('Kayıt başarılı! Lütfen e-postanızı kontrol edin.');
      }
    } catch (err: any) {
      console.error("Auth Catch Error:", err);
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const redirectTo = window.location.origin.includes('run.app') 
        ? `${window.location.origin}/auth/callback` 
        : 'https://engelsizforum.com/auth/callback';
        
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError(err.message || 'Google ile giriş yapılamadı.');
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <main className="flex-1 flex items-center justify-center p-6 bg-muted/20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-card border border-border p-6 sm:p-10 md:p-12 rounded-3xl shadow-sm"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
              {isLogin ? 'Tekrar Hoş Geldiniz' : 'Aramıza Katılın'}
            </h1>
            <p className="text-base text-muted-foreground font-medium">
              {isLogin ? 'EngelsizForum topluluğuna giriş yapın.' : 'Kapsayıcı bir topluluğun parçası olun.'}
            </p>
          </div>

          <div className="space-y-6 mb-10">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-background border border-border px-6 py-4 rounded-xl font-bold text-sm hover:bg-muted transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google ile {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-card px-4 text-muted-foreground font-bold">Veya</span></div>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="username" className="text-xs font-bold uppercase tracking-widest ml-1">Kullanıcı Adı</label>
                <div className="relative">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm"
                    placeholder="kullanici_adiniz"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest ml-1">E-posta Adresi</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm"
                  placeholder="e-posta@adresiniz.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest ml-1">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm"
                  placeholder="En az 6 karakter"
                />
              </div>
            </div>

            {error && (
              <div 
                role="alert" 
                className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-bold text-xs"
              >
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-3 w-full rounded-xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              {loading ? <Loader2 className="animate-spin" /> : isLogin ? <><LogIn size={18} /> GİRİŞ YAP</> : <><UserPlus size={18} /> KAYIT OL</>}
            </button>
            
            {isLogin && (
              <div className="text-center">
                <Link href="/auth/forgot-password" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors cursor-pointer">
                  ŞİFREMİ UNUTTUM?
                </Link>
              </div>
            )}
          </form>

          <div className="mt-10 text-center border-t border-border pt-8">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-bold uppercase tracking-widest text-primary hover:opacity-80 transition-all rounded-xl px-6 py-3"
            >
              {isLogin ? 'YENİ HESAP OLUŞTUR' : 'ZATEN ÜYEYİM, GİRİŞ YAP'}
            </button>
          </div>
        </motion.div>
      </main>
    </SiteLayout>
  );
}
