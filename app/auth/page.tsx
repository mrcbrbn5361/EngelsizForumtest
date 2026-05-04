'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/layout/navbar';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { useAuth } from '@/components/providers/auth-provider';
import { LogIn, UserPlus, Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

/**
 * Accessible Auth Page for EngelsizForum with Google Login.
 */
export default function AuthPage() {
  const { user, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      window.location.href = '/';
    }
  }, [user, authLoading]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = '/';
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
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
        
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google girişi sırasında bir hata oluştu.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-card border-4 border-border rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] p-8 md:p-12"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
              {isLogin ? 'Tekrar Hoş Geldiniz' : 'Aramıza Katılın'}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed">
              {isLogin ? 'EngelsizForum topluluğuna giriş yapın.' : 'Kapsayıcı bir topluluğun parçası olun.'}
            </p>
          </div>

          <div className="space-y-6 mb-10">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 bg-card border-2 border-border px-8 py-5 rounded-2xl font-black text-base hover:bg-muted transition-all shadow-sm outline-none focus:ring-4 focus:ring-primary/20 active:scale-95 group"
            >
              <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google ile {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-border"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-4 text-muted-foreground uppercase tracking-[0.3em] font-black">Veya</span></div>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div className="space-y-3">
                <label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">
                  Kullanıcı Adı
                </label>
                <div className="relative group">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-border bg-background outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-base"
                    placeholder="kullanici_adiniz"
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">
                E-posta Adresi
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-border bg-background outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-base"
                  placeholder="e-posta@adresiniz.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">
                Şifre
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-border bg-background outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-base"
                  placeholder="En az 8 karakter"
                />
              </div>
            </div>

            {error && (
              <div 
                role="alert" 
                className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 text-destructive border-2 border-destructive/20 font-bold text-sm"
              >
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-[2rem] bg-primary text-primary-foreground font-black text-lg shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              {loading ? 'İşleniyor...' : isLogin ? <><LogIn size={24} /> Giriş Yap</> : <><UserPlus size={24} /> Kayıt Ol</>}
            </button>
            {isLogin && (
              <div className="text-center mt-4">
                <a href="/auth/forgot-password" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                  Şifremi unuttum?
                </a>
              </div>
            )}
          </form>

          <div className="mt-10 text-center border-t-2 border-border pt-8">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors outline-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-2"
            >
              {isLogin ? 'Yeni Hesap Oluştur' : 'Zaten Üyeyim, Giriş Yap'}
            </button>
          </div>
        </motion.div>
      </main>
      <AccessibilityToolbar />
    </div>
  );
}
