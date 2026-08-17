'use client';

import React, { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatAuthError } from '@/lib/auth-utils';
import { useAccessibility } from '@/components/providers/accessibility-provider';
import { Mail, Lock, User, AlertCircle, Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface RegisterFormProps {
  onSuccess?: () => void;
  className?: string;
}

/**
 * Reusable, accessible Register Form component.
 */
export function RegisterForm({ onSuccess, className = '' }: RegisterFormProps) {
  const router = useRouter();
  const { fontSize, highContrast, dyslexicFont, bionicReading, reducedMotion, focusMode } = useAccessibility();

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const usernameId = useId();
  const fullNameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const passwordConfirmId = useId();
  const errorId = useId();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalı ve yalnızca İngilizce harf/rakam içermelidir.');
      return;
    }

    if (!fullName.trim()) {
      setError('Lütfen adınızı ve soyadınızı giriniz.');
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('E-posta adresi boş bırakılamaz.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Şifreler uyuşmuyor.');
      return;
    }

    setLoading(true);
    try {
      const accessibilityPrefs = {
        fontSize,
        highContrast,
        dyslexicFont,
        bionicReading,
        reducedMotion,
        focusMode
      };

      const { error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            username: cleanUsername,
            full_name: fullName.trim(),
            display_name: fullName.trim(),
            accessibility_prefs: accessibilityPrefs
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      toast.success('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/login?registered=true');
      }
    } catch (err: any) {
      console.error('Register submit error:', err);
      setError(formatAuthError(err, 'Kayıt sırasında bir hata oluştu. Lütfen bilgilerinizi kontrol ediniz.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className={`space-y-3.5 ${className}`} noValidate>
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

      {/* Username */}
      <div className="space-y-1">
        <label htmlFor={usernameId} className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Kullanıcı Adı <span className="text-rose-400" aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} aria-hidden="true" />
          <input
            id={usernameId}
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-sm font-medium rounded-xl border border-white/[0.08] bg-[#0b0f19] text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-500 transition-colors"
            placeholder="ornek_kullanici"
            autoComplete="username"
          />
        </div>
      </div>

      {/* Full Name */}
      <div className="space-y-1">
        <label htmlFor={fullNameId} className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Adınız Soyadınız <span className="text-rose-400" aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} aria-hidden="true" />
          <input
            id={fullNameId}
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-sm font-medium rounded-xl border border-white/[0.08] bg-[#0b0f19] text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-500 transition-colors"
            placeholder="Ahmet Yılmaz"
            autoComplete="name"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1">
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
            className="w-full h-10 pl-10 pr-4 text-sm font-medium rounded-xl border border-white/[0.08] bg-[#0b0f19] text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-500 transition-colors"
            placeholder="adiniz@eposta.com"
            autoComplete="email"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1">
        <label htmlFor={passwordId} className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Şifre <span className="text-rose-400" aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} aria-hidden="true" />
          <input
            id={passwordId}
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 pl-10 pr-10 text-sm font-medium rounded-xl border border-white/[0.08] bg-[#0b0f19] text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-500 transition-colors"
            placeholder="En az 8 karakter"
            autoComplete="new-password"
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

      {/* Password Confirm */}
      <div className="space-y-1">
        <label htmlFor={passwordConfirmId} className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Şifre Tekrarı <span className="text-rose-400" aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} aria-hidden="true" />
          <input
            id={passwordConfirmId}
            type={showPassword ? "text" : "password"}
            required
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-sm font-medium rounded-xl border border-white/[0.08] bg-[#0b0f19] text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-500 transition-colors"
            placeholder="Şifrenizi tekrar girin"
            autoComplete="new-password"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <UserPlus size={16} />
        )}
        {loading ? 'Kaydediliyor...' : 'Hesap Oluştur'}
      </button>
    </form>
  );
}
