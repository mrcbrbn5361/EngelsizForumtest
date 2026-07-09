'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Navbar } from '@/components/layout/navbar';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // 1. Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Reset Password Auth Event:', event);
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
        setVerifying(false);
      }
    });

    // 2. Immediate session check
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
    setError(null);
    setMessage(null);

    // Strong password check: min 8 characters
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
      console.log('Attempting to update user password...');
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      // Kullanıcının şifresi güncellendikten sonra otomatik olarak oturum açık kalmasını engelle
      // Güvenlik gereği tekrar e-posta ve şifre ile giriş yapması için çıkış yaptır
      await supabase.auth.signOut();

      setMessage({ 
        type: 'success', 
        text: 'Şifreniz başarıyla güncellendi! 2 saniye içinde giriş sayfasına yönlendiriliyorsunuz.' 
      });
      
      // Auto redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/auth';
      }, 2000);
    } catch (err: any) {
      console.error('Update password error:', err);
      setMessage({ 
        type: 'error', 
        text: err.message || 'Şifre güncellenirken bir hata oluştu. Bağlantının süresi dolmuş olabilir.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const setError = (text: string | null) => {
    if (text) {
      setMessage({ type: 'error', text });
    } else {
      setMessage(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-card border border-border rounded-3xl shadow-xl p-8"
        >
          {verifying ? (
            <div className="text-center py-12 space-y-4">
              <Loader2 className="animate-spin text-primary mx-auto" size={48} />
              <p className="text-muted-foreground font-medium animate-pulse" aria-live="polite">
                Bağlantı doğrulanıyor... Lütfen bekleyin.
              </p>
            </div>
          ) : !isRecovery ? (
            <div className="text-center space-y-6 py-6">
              <AlertCircle className="text-destructive mx-auto" size={56} />
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Geçersiz Bağlantı</h1>
                <p className="text-muted-foreground text-sm">
                  Şifre sıfırlama bağlantısı geçersiz, süresi dolmuş veya zaten kullanılmış.
                </p>
              </div>
              <a 
                href="/auth/forgot-password" 
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:bg-primary/90 transition-all"
              >
                Yeni Şifre Sıfırlama Bağlantısı İste
              </a>
              <div className="text-center">
                <a href="/auth" className="text-sm text-muted-foreground hover:text-foreground font-medium inline-flex items-center gap-2">
                  <ArrowLeft size={16} /> Giriş Sayfasına Dön
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Yeni Şifre Oluştur</h1>
                <p className="text-muted-foreground">Lütfen yeni ve güçlü bir şifre girin.</p>
              </div>

              <form onSubmit={handleReset} className="space-y-5">
                {/* Password field */}
                <div className="space-y-2 relative">
                  <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                    <Lock size={16} /> Yeni Şifre (Min. 8 karakter)
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-4 pr-12 py-3 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="Yeni şifreniz"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md"
                      aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password field */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                    <Lock size={16} /> Şifre Tekrarı
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Şifrenizi tekrar girin"
                    disabled={loading}
                  />
                </div>

                {message && (
                  <div 
                    role="status"
                    aria-live="polite"
                    className={`flex items-start gap-3 p-4 rounded-2xl border-2 font-bold text-sm ${
                      message.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
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
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Güncelleniyor...</span>
                    </>
                  ) : (
                    'Şifreyi Güncelle'
                  )}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
