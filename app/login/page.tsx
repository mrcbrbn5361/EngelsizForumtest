'use client';

import React, { useState, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SiteLayout } from '@/components/layout/site-layout';
import { useAuth } from '@/components/providers/auth-provider';
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
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('ef_remembered_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
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
        if (signInError.message?.includes('Invalid login credentials')) {
          throw new Error('E-posta adresi veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.');
        }
        if (signInError.message?.includes('Email not confirmed')) {
          throw new Error('Lütfen e-posta adresinize gönderilen onaylama linkini tıklayarak hesabınızı doğrulayın.');
        }
        throw signInError;
      }

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('ef_remembered_email', email);
      } else {
        localStorage.removeItem('ef_remembered_email');
      }

      toast.success('Giriş başarılı! EngelsizForum\'a hoş geldiniz.');
      router.push('/discussions');
    } catch (err: any) {
      console.error("Login Catch Error:", err);
      setError(err.message || 'Giriş yapılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.');
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
        
      const { error: oAuthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });
      if (oAuthError) throw oAuthError;
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError(err.message || 'Google ile giriş yaparken teknik bir sorun oluştu.');
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <div className="flex-1 min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-muted/10 to-muted/30">
        <main className="w-full max-w-xl">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="vibe-card p-8 sm:p-12 border-2 border-border shadow-2xl rounded-[2.5rem] bg-card relative overflow-hidden"
          >
            {/* Visual ambient details */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12 -z-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -ml-12 -mb-12 -z-10" />

            {/* Form Header */}
            <header className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                <Sparkles size={10} className="fill-current" /> ENGELSİZ ERİŞİM SİSTEMİ
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                Tekrar Hoş Geldiniz
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-semibold uppercase tracking-wider mt-3">
                Kapsayıcı, engelsiz ve güvenli bilgi paylaşım ağı.
              </p>
            </header>

            {/* Social Authentication */}
            <div className="space-y-4 mb-8">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-background border-2 border-border hover:border-primary/40 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-foreground hover:bg-muted/30 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
                aria-label="Google Hesabı ile Giriş Yap"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google ile Giriş Yap
              </button>

              <div className="relative py-2" aria-hidden="true">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-card px-4 text-muted-foreground font-black tracking-widest">VEYA E-POSTA İLE</span>
                </div>
              </div>
            </div>

            {/* Error Message Section */}
            {error && (
              <div 
                role="alert" 
                className="flex items-start gap-3 p-4 mb-6 rounded-2xl bg-destructive/10 text-destructive border-2 border-destructive/20 font-bold text-xs uppercase tracking-wide leading-relaxed"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Standard Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* E-mail Input */}
              <div className="space-y-2">
                <label htmlFor={emailId} className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  E-posta Adresi <span className="text-destructive" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                  <input
                    id={emailId}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="vibe-input pl-12 pr-4 h-14 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none font-semibold transition-all w-full"
                    placeholder="ornek@adresiniz.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label htmlFor={passwordId} className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Şifre <span className="text-destructive" aria-hidden="true">*</span>
                  </label>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded px-1"
                  >
                    Şifremi Unuttum?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                  <input
                    id={passwordId}
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="vibe-input pl-12 pr-12 h-14 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none font-semibold transition-all w-full"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded p-1"
                    aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Toggle */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    id={rememberMeId}
                    role="checkbox"
                    aria-checked={rememberMe}
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`size-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
                      rememberMe 
                        ? 'bg-primary border-primary text-white' 
                        : 'border-border hover:border-primary/40 bg-background'
                    }`}
                    aria-label="Beni Hatırla"
                  >
                    {rememberMe && <Check size={14} className="stroke-[4]" />}
                  </button>
                  <label 
                    onClick={() => setRememberMe(!rememberMe)} 
                    className="text-xs font-black uppercase tracking-widest text-muted-foreground select-none cursor-pointer"
                  >
                    Beni Hatırla
                  </label>
                </div>

                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <HelpCircle size={14} />
                  <span className="text-[10px] font-black uppercase tracking-wider">GÜVENLİ GİRİŞ</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full vibe-button-primary h-14 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 mt-4"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <LogIn size={16} className="stroke-[3]" />
                )}
                {loading ? 'SİSTEME GİRİŞ YAPILIYOR...' : 'SİSTEME GİRİŞ YAP'}
              </button>
            </form>

            {/* Registration Promotion Section */}
            <footer className="mt-10 pt-8 border-t border-border text-center">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-4">
                Henüz bir hesabınız yok mu?
              </p>
              <Link 
                href="/register" 
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary/20 hover:border-primary/50 text-primary hover:bg-primary/5 font-black text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer"
              >
                <UserPlus size={14} className="stroke-[3]" /> Engelsiz Sihirbazla Kayıt Ol
              </Link>
            </footer>

          </motion.div>
        </main>
      </div>
    </SiteLayout>
  );
}
