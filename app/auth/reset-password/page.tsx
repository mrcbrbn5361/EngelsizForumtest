'use client';

import React, { useState, useEffect, useId } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Circle, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { AuthCard, AuthAlert, authInputClass, authLabelClass, authPrimaryButtonClass, authSecondaryLinkClass } from '@/components/auth/auth-card';
import Link from 'next/link';
import { formatAuthError, validatePasswordStrength } from '@/lib/auth-utils';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const passwordId = useId();
  const confirmPasswordId = useId();
  const rulesId = useId();

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) {
        setIsRecovery(true);
        setVerifying(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session) {
        setIsRecovery(true);
      }
      setVerifying(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const { hasLength, hasNumberOrSpecial } = validatePasswordStrength(password);
  const isMatching = password.length > 0 && password === confirmPassword;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!hasLength) {
      setMessage({ type: 'error', text: 'Yeni şifreniz en az 8 karakter uzunluğunda olmalıdır.' });
      return;
    }

    if (!hasNumberOrSpecial) {
      setMessage({ type: 'error', text: 'Şifreniz en az bir rakam veya özel karakter içermelidir.' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Şifreler birbiriyle eşleşmiyor. Lütfen kontrol edin.' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      try {
        sessionStorage.removeItem('password_recovery_active');
      } catch (e) {}

      await supabase.auth.signOut();

      setMessage({ 
        type: 'success', 
        text: 'Şifreniz başarıyla güncellendi! Giriş sayfasına aktarılıyorsunuz...' 
      });
      
      setTimeout(() => {
        window.location.href = '/login?success=' + encodeURIComponent('Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.');
      }, 1800);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setMessage({ 
        type: 'error', 
        text: formatAuthError(err, 'Şifre güncellenirken bir hata oluştu. Bağlantı süresi dolmuş olabilir.') 
      });
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <AuthCard crumb="Yeni Şifre" icon={Loader2} iconClassName="animate-spin" title="Bağlantı doğrulanıyor..." subtitle="Lütfen bekleyin" />
    );
  }

  if (!isRecovery) {
    return (
      <AuthCard
        crumb="Yeni Şifre"
        icon={AlertCircle}
        tone="error"
        title="Geçersiz Bağlantı"
        subtitle="Bağlantının süresi dolmuş ya da daha önce kullanılmış olabilir"
      >
        <p className="text-xs text-fg-3 leading-relaxed">
          Şifre sıfırlama bağlantıları tek kullanımlıktır ve bir süre sonra geçersiz olur. Yeni bir bağlantı isteyip e-postadaki en son bağlantıyı açın.
        </p>
        <Link href="/auth/forgot-password" className={authPrimaryButtonClass}>
          Yeni Bağlantı İste
        </Link>
        <div className="pt-4 border-t border-line text-center">
          <Link href="/login" className={authSecondaryLinkClass}>
            <ArrowLeft size={14} aria-hidden="true" /> Giriş sayfasına dön
          </Link>
        </div>
      </AuthCard>
    );
  }

  const rules = [
    { ok: hasLength, text: 'En az 8 karakter' },
    { ok: hasNumberOrSpecial, text: 'En az 1 rakam veya özel karakter' },
    { ok: isMatching, text: 'Şifreler birbiriyle eşleşiyor' },
  ];

  return (
    <AuthCard
      crumb="Yeni Şifre"
      icon={ShieldCheck}
      title="Yeni Şifre Belirleyin"
      subtitle="Hesabınız için güçlü ve tahmin edilmesi zor bir şifre seçin"
    >
      <form onSubmit={handleReset} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor={passwordId} className={authLabelClass}>Yeni Şifre</label>
          <div className="relative">
            <input
              id={passwordId}
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${authInputClass} pr-11`}
              placeholder="Yeni şifreniz"
              disabled={loading}
              aria-describedby={rulesId}
              aria-invalid={password.length > 0 && (!hasLength || !hasNumberOrSpecial)}
            />
            <Lock size={16} className="absolute left-3.5 top-3.5 text-fg-4 pointer-events-none" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-fg-4 hover:text-fg cursor-pointer p-1.5 rounded"
              aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={confirmPasswordId} className={authLabelClass}>Şifre Tekrarı</label>
          <div className="relative">
            <input
              id={confirmPasswordId}
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={authInputClass}
              placeholder="Şifrenizi tekrar girin"
              disabled={loading}
              aria-invalid={confirmPassword.length > 0 && !isMatching}
            />
            <Lock size={16} className="absolute left-3.5 top-3.5 text-fg-4 pointer-events-none" aria-hidden="true" />
          </div>
        </div>

        <ul id={rulesId} className="p-3.5 rounded-md bg-surface-hover border border-line space-y-1.5 text-[11px]" aria-label="Şifre kuralları">
          {rules.map((r) => (
            <li key={r.text} className={`flex items-center gap-2 ${r.ok ? 'text-emerald-400 light:text-emerald-700' : 'text-fg-4'}`}>
              {r.ok ? <CheckCircle2 size={14} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
              <span>{r.text}</span>
              <span className="sr-only">{r.ok ? '(karşılandı)' : '(henüz karşılanmadı)'}</span>
            </li>
          ))}
        </ul>

        {message && <AuthAlert type={message.type}>{message.text}</AuthAlert>}

        <button
          type="submit"
          disabled={loading || !hasLength || !hasNumberOrSpecial || !isMatching}
          className={authPrimaryButtonClass}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} aria-hidden="true" />
              <span>Kaydediliyor...</span>
            </>
          ) : (
            <>
              <ShieldCheck size={16} aria-hidden="true" />
              <span>Şifreyi Kaydet</span>
            </>
          )}
        </button>
      </form>
    </AuthCard>
  );
}

