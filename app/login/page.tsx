'use client';

import React, { useState, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SiteLayout } from '@/components/layout/site-layout';
import { useAuth } from '@/components/providers/auth-provider';
import { formatAuthError } from '@/lib/auth-utils';
import { 
  LogIn, Mail, Lock, AlertCircle, Loader2, Sparkles, 
  HelpCircle, Eye, EyeOff, Check, UserPlus
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { toast } from 'sonner';

/**
 * Premium, WCAG 2.1 AA Compliant, Highly Accessible Login Page.
 */
export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailId = useId();
  const passwordId = useId();
  const rememberMeId = useId();

  // Load Remembered Email
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedEmail = localStorage.getItem('ef_remembered_email');
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      }
    } catch (e) {}
  }, []);

  // Redirect if logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/discussions');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (signInError) {
        throw signInError;
      }

      // Handle Remember Me
      try {
        if (rememberMe) {
          localStorage.setItem('ef_remembered_email', email);
        } else {
          localStorage.removeItem('ef_remembered_email');
        }
      } catch (e) {}

      toast.success('Giriş başarılı! EngelsizForum\'a hoş geldiniz.');
      router.push('/discussions');
    } catch (err: any) {
      console.error("Login Catch Error:", err);
      setError(formatAuthError(err, 'Giriş yapılamadı. E-posta adresi veya şifrenizi kontrol edin.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
        
      const { error: oAuthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });
      if (oAuthError) throw oAuthError;
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError(formatAuthError(err, 'Google ile giriş yapılırken bir sorun oluştu.'));
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <div className="flex-1 min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-muted/10 to-muted/30">
        <main className="w-full max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-10 border border-border/80 shadow-xs rounded-2xl bg-card relative overflow-hidden space-y-6"
          >
            {/* Form Header */}
            <header className="text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                <Sparkles size={11} className="fill-current" /> ENGELSİZ ERİŞİM SİSTEMİ
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Tekrar Hoş Geldiniz
              </h1>
              <p className="text-xs text-muted-foreground font-normal leading-relaxed">
                Kapsayıcı, engelsiz ve güvenli bilgi paylaşım ağı.
              </p>
            </header>

            {/* Social Authentication */}
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-background border border-border/80 hover:border-sky-500/40 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-foreground hover:bg-muted/30 transition-all cursor-pointer outline-none"
                aria-label="Google Hesabı ile Giriş Yap"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google ile Giriş Yap
              </button>

              <div className="relative py-1" aria-hidden="true">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/60"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-card px-3 text-muted-foreground font-bold tracking-wider">VEYA E-POSTA İLE</span>
                </div>
              </div>
            </div>

            {/* Error Message Section */}
            {error && (
              <div 
                role="alert" 
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-bold text-xs leading-relaxed"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Standard Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* E-mail Input */}
              <div className="space-y-1.5">
                <label htmlFor={emailId} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  E-posta Adresi <span className="text-destructive" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" size={16} />
                  <input
                    id={emailId}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 text-sm font-medium rounded-xl border border-border/80 bg-background text-foreground outline-none focus:border-sky-500 transition-colors"
                    placeholder="ornek@adresiniz.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-0.5">
                  <label htmlFor={passwordId} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Şifre <span className="text-destructive" aria-hidden="true">*</span>
                  </label>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-[11px] font-bold text-sky-400 hover:underline outline-none"
                  >
                    Şifremi Unuttum?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" size={16} />
                  <input
                    id={passwordId}
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-10 text-sm font-medium rounded-xl border border-border/80 bg-background text-foreground outline-none focus:border-sky-500 transition-colors"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer outline-none p-1"
                    aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Toggle */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id={rememberMeId}
                    role="checkbox"
                    aria-checked={rememberMe}
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`size-5 rounded-md border flex items-center justify-center transition-all cursor-pointer outline-none ${
                      rememberMe 
                        ? 'bg-sky-500 border-sky-500 text-white' 
                        : 'border-border/80 hover:border-sky-500/40 bg-background'
                    }`}
                    aria-label="Beni Hatırla"
                  >
                    {rememberMe && <Check size={12} className="stroke-[3]" />}
                  </button>
                  <label 
                    onClick={() => setRememberMe(!rememberMe)} 
                    className="text-xs font-bold text-muted-foreground select-none cursor-pointer"
                  >
                    Beni Hatırla
                  </label>
                </div>

                <div className="flex items-center gap-1 text-muted-foreground text-[11px] font-semibold">
                  <HelpCircle size={13} />
                  <span>GÜVENLİ GİRİŞ</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <LogIn size={16} />
                )}
                {loading ? 'Giriş Yapılıyor...' : 'Sisteme Giriş Yap'}
              </button>
            </form>

            {/* Registration Promotion Section */}
            <footer className="pt-4 border-t border-border/60 text-center space-y-3">
              <p className="text-xs text-muted-foreground font-normal">
                Henüz bir hesabınız yok mu?
              </p>
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-sky-500/30 hover:border-sky-500 text-sky-400 hover:bg-sky-500/10 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                <UserPlus size={14} /> Engelsiz Sihirbazla Kayıt Ol
              </Link>
            </footer>

          </motion.div>
        </main>
      </div>
    </SiteLayout>
  );
}
