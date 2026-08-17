'use client';

import React, { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatAuthError } from '@/lib/auth-utils';
import { Mail, Lock, AlertCircle, Loader2, LogIn, Eye, EyeOff, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

/**
 * Reusable, WCAG 2.2 AAA compliant Login Form component.
 */
export function LoginForm({ onSuccess, redirectTo = '/discussions', className = '' }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Lütfen e-posta adresinizi giriniz.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Geçerli bir e-posta adresi yazınız (örnek: isim@domain.com).');
      return;
    }
    if (!password) {
      setError('Lütfen şifrenizi giriniz.');
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (signInError) {
        throw signInError;
      }

      toast.success('Giriş başarılı! Yönlendiriliyorsunuz...');
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: any) {
      console.error('Login submit error:', err);
      setError(formatAuthError(err, 'E-posta veya şifreniz hatalı. Lütfen kontrol edip tekrar deneyin.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className={`space-y-4 ${className}`} noValidate>
      {error && (
        <div 
          id={errorId}
          role="alert" 
          aria-live="assertive"
          className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-bold text-xs leading-relaxed"
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Email field */}
      <div className="space-y-1.5">
        <label htmlFor={emailId} className="text-xs font-bold uppercase tracking-wider text-slate-300">
          E-posta Adresi <span className="text-rose-400" aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} aria-hidden="true" />
          <input
            id={emailId}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 pl-10 pr-4 text-sm font-medium rounded-xl border border-white/[0.08] bg-[#0b0f19] text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-500 transition-colors"
            placeholder="adiniz@eposta.com"
            autoComplete="email"
          />
        </div>
      </div>

      {/* Password field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor={passwordId} className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Şifre <span className="text-rose-400" aria-hidden="true">*</span>
          </label>
          <Link 
            href="/auth/forgot-password" 
            className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 transition-colors"
          >
            Şifremi Unuttum?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} aria-hidden="true" />
          <input
            id={passwordId}
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 pl-10 pr-10 text-sm font-medium rounded-xl border border-white/[0.08] bg-[#0b0f19] text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-500 transition-colors"
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer outline-none p-1"
            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <LogIn size={16} />
        )}
        {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
      </button>
    </form>
  );
}
