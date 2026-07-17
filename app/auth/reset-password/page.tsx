'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { SiteLayout } from '@/components/layout/site-layout';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
        setVerifying(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsRecovery(true);
      }
      setVerifying(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Yeni şifre en az 8 karakter olmalıdır.' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Şifreler eşleşmiyor. Lütfen kontrol edin.' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      sessionStorage.removeItem('password_recovery_active');
      await supabase.auth.signOut();

      setMessage({ 
        type: 'success', 
        text: 'Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...' 
      });
      
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1500);
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.message || 'Şifre güncellenirken bir hata oluştu. Bağlantının süresi dolmuş olabilir.' 
      });
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
          {verifying ? (
            <div className="text-center py-12 space-y-4">
              <Loader2 className="animate-spin text-primary mx-auto" size={48} />
              <p className="text-muted-foreground font-black uppercase tracking-widest text-xs animate-pulse" aria-live="polite">
                BAĞLANTI DOĞRULANIYOR...
              </p>
            </div>
          ) : !isRecovery ? (
            <div className="text-center space-y-6 py-6">
              <AlertCircle className="text-destructive mx-auto" size={56} />
              <div className="space-y-2">
                <h1 className="text-2xl font-black uppercase tracking-tight">Geçersiz Bağlantı</h1>
                <p className="text-muted-foreground text-sm font-medium">
                  Şifre sıfırlama bağlantısı geçersiz, süresi dolmuş veya zaten kullanılmış.
                </p>
              </div>
              <Link 
                href="/auth/forgot-password" 
                className="vibe-button-primary w-full h-14"
              >
                YENİ BAĞLANTI İSTE
              </Link>
              <div className="text-center">
                <Link href="/auth" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center justify-center gap-2">
                  <ArrowLeft size={16} /> GİRİŞ SAYFASINA DÖN
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black mb-2 tracking-tight uppercase">Yeni Şifre</h1>
                <p className="text-muted-foreground font-medium text-sm">Lütfen yeni ve güçlü bir şifre girin.</p>
              </div>

              <form onSubmit={handleReset} className="space-y-6">
                <div className="space-y-2 relative">
                  <label htmlFor="password" className="vibe-label">Yeni Şifre (Min. 8 karakter)</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="vibe-input h-14"
                      placeholder="Yeni şifreniz"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="vibe-label">Şifre Tekrarı</label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="vibe-input h-14"
                    placeholder="Şifrenizi tekrar girin"
                    disabled={loading}
                  />
                </div>

                {message && (
                  <div 
                    role="status"
                    aria-live="polite"
                    className={`flex items-start gap-3 p-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest ${
                      message.type === 'success' 
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                        : 'bg-destructive/10 text-destructive border-destructive/20'
                    }`}
                  >
                    {message.type === 'success' ? (
                      <CheckCircle size={20} className="shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    )}
                    <span>{message.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="vibe-button-primary w-full h-14"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>GÜNCELLENİYOR...</span>
                    </>
                  ) : (
                    'ŞİFREYİ GÜNCELLE'
                  )}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </main>
    </SiteLayout>
  );
}
