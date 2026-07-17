'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { SiteLayout } from '@/components/layout/site-layout';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <main className="vibe-container py-12 md:py-24 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md vibe-card p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black mb-2 tracking-tight uppercase">Şifremi Unuttum</h1>
            <p className="text-muted-foreground font-medium text-sm">E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.</p>
          </div>

          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="vibe-label">E-posta</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="vibe-input h-14"
                placeholder="e-posta@adresiniz.com"
              />
            </div>

            {message && (
              <div 
                role="status"
                aria-live="polite"
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest ${
                  message.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                    : 'bg-destructive/10 text-destructive border-destructive/20'
                }`}
              >
                {message.type === 'success' ? <CheckCircle size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                <p>{message.text}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="vibe-button-primary w-full h-14"
            >
              {loading ? 'GÖNDERİLİYOR...' : 'BAĞLANTI GÖNDER'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/auth" className="text-xs font-black uppercase tracking-widest text-primary hover:underline flex items-center justify-center gap-2">
              <ArrowLeft size={16} /> GERİ DÖN
            </Link>
          </div>
        </motion.div>
      </main>
    </SiteLayout>
  );
}
