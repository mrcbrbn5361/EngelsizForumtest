'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import { AuthCard, AuthAlert, authInputClass, authLabelClass, authPrimaryButtonClass, authSecondaryLinkClass } from '@/components/auth/auth-card';
import Link from 'next/link';
import { formatAuthError } from '@/lib/auth-utils';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const linkError = new URLSearchParams(window.location.search).get('error');
    if (linkError) setMessage({ type: 'error', text: linkError });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setMessage({ type: 'error', text: 'Lütfen geçerli bir e-posta adresi girin (örnek: isim@domain.com).' });
      return;
    }

    if (sentCount >= 3) {
      setMessage({ type: 'error', text: 'Çok fazla sıfırlama talebi gönderdiniz. Lütfen birkaç dakika bekleyin.' });
      return;
    }

    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback?type=recovery`;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });

      if (error) throw error;

      setSentCount(prev => prev + 1);
      setMessage({ 
        type: 'success', 
        text: 'Şifre sıfırlama talimatları e-posta adresinize gönderildi. Lütfen gelen kutunuzu (ve gereksiz/spam klasörünü) kontrol edin.' 
      });
    } catch (err: any) {
      console.error('Password reset error:', err);
      setMessage({ 
        type: 'error', 
        text: formatAuthError(err, 'Şifre sıfırlama talebi iletilemedi. Lütfen e-posta adresinizi kontrol edip tekrar deneyin.') 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      crumb="Şifremi Unuttum"
      icon={KeyRound}
      title="Şifremi Unuttum"
      subtitle="E-posta adresinize güvenli bir şifre sıfırlama bağlantısı gönderelim"
    >
      <form onSubmit={handleReset} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="reset-email" className={authLabelClass}>
            E-posta Adresi <span className="text-rose-400 light:text-rose-700">*</span>
          </label>
          <div className="relative">
            <input
              id="reset-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputClass}
              placeholder="ornek@engelsizforum.com"
              disabled={loading}
              aria-describedby={message ? 'status-message' : undefined}
            />
            <Mail size={16} className="absolute left-3.5 top-3.5 text-fg-4 pointer-events-none" aria-hidden="true" />
          </div>
        </div>

        {message && <AuthAlert type={message.type} id="status-message">{message.text}</AuthAlert>}

        <button type="submit" disabled={loading || !email.trim()} className={authPrimaryButtonClass}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} aria-hidden="true" />
              <span>Gönderiliyor...</span>
            </>
          ) : (
            <>
              <Mail size={16} aria-hidden="true" />
              <span>Sıfırlama Bağlantısı Gönder</span>
            </>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-line text-center">
        <Link href="/login" className={authSecondaryLinkClass}>
          <ArrowLeft size={14} aria-hidden="true" /> Giriş sayfasına dön
        </Link>
      </div>
    </AuthCard>
  );
}
