'use client';

import React, { useState, useEffect, useId } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { SiteLayout } from '@/components/layout/site-layout';
import Link from 'next/link';
import { formatAuthError } from '@/lib/auth-utils';

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

  const hasLength = password.length >= 8;
  const hasNumberOrSpecial = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
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

  return (
    <SiteLayout>
      <main className="vibe-container py-12 md:py-24 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 sm:p-10 border border-white/[0.08] shadow-2xl rounded-3xl bg-[#111726]/90 backdrop-blur-md text-slate-100"
        >
          {verifying ? (
            <div className="text-center py-12 space-y-4">
              <Loader2 className="animate-spin text-sky-400 mx-auto" size={44} aria-hidden="true" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse" role="status" aria-live="polite">
                BAĞLANTI DOĞRULANIYOR...
              </p>
            </div>
          ) : !isRecovery ? (
            <div className="text-center space-y-6 py-6">
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center mx-auto">
                <AlertCircle size={32} aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-100">Geçersiz Bağlantı</h1>
                <p className="text-slate-400 text-xs font-normal leading-relaxed">
                  Şifre sıfırlama bağlantısının süresi dolmuş, tek kullanımlık hak tüketilmiş veya geçersiz bir bağlantı kullanılmış olabilir.
                </p>
              </div>
              <Link 
                href="/auth/forgot-password" 
                className="w-full h-12 flex items-center justify-center bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-sky-500/20"
              >
                YENİ BAĞLANTI İSTE
              </Link>
              <div className="text-center pt-2">
                <Link href="/auth" className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2">
                  <ArrowLeft size={16} aria-hidden="true" /> GİRİŞ SAYFASINA DÖN
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck size={24} aria-hidden="true" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-100">Yeni Şifre Belirleyin</h1>
                <p className="text-xs text-slate-400 font-normal leading-relaxed">
                  Hesap güvenliğiniz için güçlü ve tahmin edilmesi zor bir şifre seçin.
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <label htmlFor={passwordId} className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Yeni Şifre
                  </label>
                  <div className="relative">
                    <input
                      id={passwordId}
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 bg-[#0b0f19] border border-white/[0.08] focus:border-sky-500 rounded-xl px-4 pl-10 pr-12 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors"
                      placeholder="Yeni şifreniz"
                      disabled={loading}
                      aria-invalid={password.length > 0 && (!hasLength || !hasNumberOrSpecial)}
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} aria-hidden="true" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                      aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                      {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor={confirmPasswordId} className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Şifre Tekrarı
                  </label>
                  <div className="relative">
                    <input
                      id={confirmPasswordId}
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-12 bg-[#0b0f19] border border-white/[0.08] focus:border-sky-500 rounded-xl px-4 pl-10 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors"
                      placeholder="Şifrenizi tekrar girin"
                      disabled={loading}
                      aria-invalid={confirmPassword.length > 0 && !isMatching}
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} aria-hidden="true" />
                  </div>
                </div>

                {/* Password Policy Indicators */}
                <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-white/[0.06] space-y-1.5 text-[11px]">
                  <div className={`flex items-center gap-2 ${hasLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 size={14} />
                    <span>En az 8 karakter uzunluğunda</span>
                  </div>
                  <div className={`flex items-center gap-2 ${hasNumberOrSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 size={14} />
                    <span>En az 1 rakam veya özel karakter</span>
                  </div>
                  <div className={`flex items-center gap-2 ${isMatching ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 size={14} />
                    <span>Şifreler birbiriyle eşleşiyor</span>
                  </div>
                </div>

                {message && (
                  <div 
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
                    <span className="leading-relaxed">{message.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !hasLength || !hasNumberOrSpecial || !isMatching}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-sky-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                      <span>GÜNCELLENİYOR...</span>
                    </>
                  ) : (
                    'ŞİFREYİ KAYDET VE GİRİŞ YAP'
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

