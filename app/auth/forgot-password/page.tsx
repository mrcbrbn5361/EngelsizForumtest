'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';
import { SiteLayout } from '@/components/layout/site-layout';
import Link from 'next/link';
import { formatAuthError } from '@/lib/auth-utils';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    <SiteLayout>
      <main className="vibe-container py-12 md:py-24 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 sm:p-10 border border-white/[0.08] shadow-2xl rounded-3xl bg-[#111726]/90 backdrop-blur-md text-slate-100"
        >
          <div className="text-center mb-8 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mx-auto mb-3">
              <KeyRound size={24} aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Şifremi Unuttum</h1>
            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              Hesabınıza bağlı e-posta adresinizi girin; size güvenli bir şifre sıfırlama bağlantısı gönderelim.
            </p>
          </div>

          <form onSubmit={handleReset} className="space-y-5" noValidate>
            <div className="space-y-2">
              <label htmlFor="reset-email" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                E-posta Adresi
              </label>
              <div className="relative">
                <input
                  id="reset-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-[#0b0f19] border border-white/[0.08] focus:border-sky-500 rounded-xl px-4 pl-10 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors"
                  placeholder="ornek@alanadi.com"
                  disabled={loading}
                  aria-describedby={message ? "status-message" : undefined}
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} aria-hidden="true" />
              </div>
            </div>

            {message && (
              <div 
                id="status-message"
                role="status"
                aria-live="polite"
                className={`flex items-start gap-3 p-4 rounded-2xl border text-xs font-medium ${
                  message.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-destructive/10 text-destructive border-destructive/20'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
                ) : (
                  <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
                )}
                <p className="leading-relaxed">{message.text}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full h-12 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-sky-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                  <span>GÖNDERİLİYOR...</span>
                </>
              ) : (
                'SIFIRLAMA BAĞLANTISI GÖNDER'
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/[0.08] pt-6">
            <Link 
              href="/auth" 
              className="text-xs font-bold uppercase tracking-wider text-sky-400 hover:text-sky-300 inline-flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft size={16} aria-hidden="true" /> GİRİŞ SAYFASINA DÖN
            </Link>
          </div>
        </motion.div>
      </main>
    </SiteLayout>
  );
}
